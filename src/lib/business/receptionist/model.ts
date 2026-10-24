// @polsia:user-owned — the Guide's model connection: any OpenAI-compatible /chat/completions
// endpoint, chosen by environment variables (never hard-coded, never logged).
//
// Pattern borrowed from the company gateway's provider catalogue: a known provider needs only
// its name + model + key; an explicit base URL wins and also covers the founder's own local
// model behind a tunnel or gateway. Unset or invalid config means offline mode, never an error.
//
//   RECEPTIONIST_PROVIDER  optional preset: gemini | groq | openrouter | cerebras | mistral
//   RECEPTIONIST_BASE_URL  optional explicit API root ending at /v1 (overrides the preset)
//   RECEPTIONIST_API_KEY   optional bearer key (a local gateway may not need one)
//   RECEPTIONIST_MODEL     required model id at that endpoint
//   RECEPTIONIST_TIMEOUT_MS optional per-call ceiling, default 15000

export const PROVIDER_PRESETS: Readonly<Record<string, string>> = {
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
  groq: 'https://api.groq.com/openai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  cerebras: 'https://api.cerebras.ai/v1',
  mistral: 'https://api.mistral.ai/v1',
};

export interface ModelConfig {
  baseUrl: string;
  apiKey?: string;
  model: string;
  timeoutMs: number;
}

type Env = Record<string, string | undefined>;

const clean = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

/** https anywhere; plain http only for a model on this machine (local development). */
function validBaseUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) return null;
    if (url.username || url.password) return null;
    return url.toString().replace(/\/+$/, '');
  } catch {
    return null;
  }
}

/** The configured model, or null for offline mode. Reads nothing but RECEPTIONIST_* vars. */
export function readModelConfig(env: Env = process.env): ModelConfig | null {
  const model = clean(env.RECEPTIONIST_MODEL);
  const preset = clean(env.RECEPTIONIST_PROVIDER)?.toLowerCase();
  const rawBase =
    clean(env.RECEPTIONIST_BASE_URL) ?? (preset ? PROVIDER_PRESETS[preset] : undefined);
  if (!model || !rawBase) return null;
  const baseUrl = validBaseUrl(rawBase);
  if (!baseUrl) return null;
  const timeout = Number(clean(env.RECEPTIONIST_TIMEOUT_MS));
  return {
    baseUrl,
    apiKey: clean(env.RECEPTIONIST_API_KEY),
    model,
    timeoutMs: Number.isFinite(timeout) && timeout >= 2000 && timeout <= 60_000 ? timeout : 15_000,
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** A failed model call. The message never includes the key, URL or response body. */
export class ModelError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ModelError';
  }
}

/** One non-streaming completion. Low temperature: the Guide paraphrases, it does not invent. */
export async function completeChat(
  config: ModelConfig,
  messages: readonly ChatMessage[],
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  let res: Response;
  try {
    res = await fetchImpl(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.1,
        max_tokens: 400,
      }),
      signal: AbortSignal.timeout(config.timeoutMs),
      cache: 'no-store',
    });
  } catch (error) {
    const reason =
      error instanceof Error && error.name === 'TimeoutError' ? 'timed out' : 'unreachable';
    throw new ModelError(`model ${reason}`);
  }
  if (!res.ok) throw new ModelError(`model HTTP ${res.status}`, res.status);
  const data = (await res.json().catch(() => null)) as {
    choices?: { message?: { content?: string | null } }[];
  } | null;
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new ModelError('model returned no text');
  return content;
}
