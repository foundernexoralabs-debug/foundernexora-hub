// @polsia:user-owned — the Renor Guide's knowledge base: the ONLY facts it may answer from.
//
// Every entry is written from a page on this website (or the single-source constants those
// pages render), and names that page so the answer can cite and link it. Prices, plans,
// products, channels and statuses are read from their single sources (plans.ts, plugins.ts,
// ecosystem.ts), so a correction there corrects the Guide too.
//
// Rules, enforced by tests/unit/receptionist-knowledge.test.ts:
//   - every entry cites a real internal route or a confirmed https URL;
//   - every paid-plan price is labelled as proposed;
//   - no entry claims company registration, VAT, a legal address or certifications.

import {
  CHANNELS,
  CONTACT_EMAIL,
  MILESTONES,
  PROJECTS,
  RENOR_APP_URL,
  RENOR_AREAS,
  STATUS,
} from '@/lib/business/ecosystem';
import { PAID_PLANS_NOTICE, PLAN_FAQ, PLANS } from '@/lib/business/plans';
import {
  availabilityLabel,
  listedPlugins,
  PLUGIN_CATEGORIES,
  PURCHASE_NOTE,
  REFUND_NOTE,
  SEPARATE_FROM_PLANS,
} from '@/lib/business/plugins';

/** Where an answer comes from: shown as a link under every answer. */
export interface KnowledgeSource {
  /** Short page name, e.g. "Plans". */
  label: string;
  /** Internal route (with optional #anchor) or a confirmed https URL. */
  href: string;
}

export interface KnowledgeEntry {
  id: string;
  /** The question this entry answers, in a visitor's words. */
  title: string;
  /** Extra words people use for this topic. Weighted like the title in retrieval. */
  keywords: readonly string[];
  /** The curated answer, plain text, 1–4 short sentences or a short list. */
  answer: string;
  source: KnowledgeSource;
}

const numberFormat = new Intl.NumberFormat('en-GB');

const area = (id: string) => {
  const found = RENOR_AREAS.find((item) => item.id === id);
  if (!found) throw new Error(`Renor area "${id}" is missing`);
  return found;
};

const channel = (id: (typeof CHANNELS)[number]['id']) => CHANNELS.find((item) => item.id === id);

function areaEntry(id: string, keywords: readonly string[]): KnowledgeEntry {
  const item = area(id);
  return {
    id: `renor-${id}`,
    title: `What does ${item.name} in Renor do?`,
    keywords,
    answer: `${item.name} (${STATUS[item.status].label.toLowerCase()}): ${item.summary} It can: ${item.does.join('; ')}. Limits: ${item.limits}`,
    source: { label: `Renor · ${item.name}`, href: `/renor#${item.id}` },
  };
}

const paid = PLANS.filter((plan) => plan.state === 'proposed');

function planLine(plan: (typeof PLANS)[number]): string {
  const a = plan.allowances;
  const price =
    plan.price.amount === 0 ? '£0' : `${plan.price.label} per month (proposed, not approved yet)`;
  return `${plan.name}: ${price}. ${numberFormat.format(a.creditsPerWeek)} AI credits per week, ${a.activeProjects} active projects, ${a.concurrentJobs} agent job${a.concurrentJobs === 1 ? '' : 's'} at once.`;
}

const planEntries: KnowledgeEntry[] = PLANS.map((plan) => ({
  id: `plan-${plan.id}`,
  title: `What is the Renor ${plan.name} plan and how much does it cost?`,
  keywords: [plan.name, `${plan.name} plan`, 'price', plan.price.label],
  answer:
    plan.state === 'open'
      ? `${planLine(plan)} ${plan.forWho} Free is open today: ${plan.action.note}`
      : `${planLine(plan)} ${plan.forWho} ${PAID_PLANS_NOTICE} You can join the early list by email from the Plans page.`,
  source: { label: 'Plans', href: '/renor/plans' },
}));

const planFaqEntries: KnowledgeEntry[] = PLAN_FAQ.map((item, index) => ({
  id: `plan-faq-${index + 1}`,
  title: item.q,
  keywords: ['credits', 'limit'],
  answer: item.a,
  source: { label: 'Plans · Questions', href: '/renor/plans#plan-faq' },
}));

const pluginEntries: KnowledgeEntry[] = listedPlugins().map((plugin) => ({
  id: `plugin-${plugin.slug}`,
  title: `What is ${plugin.title}?`,
  keywords: [
    plugin.line ?? '',
    plugin.audience,
    'electrician',
    'kit',
    'plugin',
    plugin.price.label,
  ].filter(Boolean),
  answer: `${plugin.title} (${availabilityLabel(plugin).toLowerCase()}, ${plugin.price.label} one-off): ${plugin.summary} Inside: ${plugin.inside.join(', ')}. It cannot be bought yet.`,
  source: { label: plugin.title, href: `/plugins/${plugin.slug}` },
}));

const projectList = PROJECTS.map(
  (project) => `${project.name} (${STATUS[project.status].label.toLowerCase()})`,
).join(', ');

const latest = MILESTONES[0];
const fiverr = channel('fiverr');
const youtube = channel('youtube');
const tiktok = channel('tiktok');
const links = channel('links');

export const KNOWLEDGE: readonly KnowledgeEntry[] = [
  {
    id: 'about-renor',
    title: 'What is Renor?',
    keywords: ['renor', 'renor ai', 'product', 'workspace', 'overview', 'what do you do'],
    answer:
      'Renor is FounderLab’s AI workspace. It brings Chat AI, Code AI, a Website Builder and a Project Office (notes, tasks and projects) together, and shows evidence of what it actually did. It is in preview: useful today, with every limit stated on the Renor page.',
    source: { label: 'Renor', href: '/renor' },
  },
  areaEntry('chat', ['chat', 'ask', 'research', 'voice', 'files', 'pdf', 'own key', 'provider']),
  areaEntry('code', ['code', 'coding', 'app', 'python', 'game', 'developer', 'bug fix']),
  areaEntry('builder', [
    'website',
    'site',
    'builder',
    'build',
    'make',
    'business',
    'landing page',
    'web page',
    'export',
  ]),
  areaEntry('project-office', ['notes', 'tasks', 'projects', 'reminder', 'memory', 'deadline']),
  {
    id: 'getting-started',
    title: 'How do I get started with Renor?',
    keywords: [
      'start',
      'get started',
      'sign up',
      'signup',
      'account',
      'open',
      'install',
      'access',
      'try',
      'begin',
      'login',
      'sign in',
    ],
    answer: `Open Renor in your browser at ${RENOR_APP_URL}, sign in, connect an AI provider or use one available to your account, then start with a chat, a small app or a website. Free is open today and there is no payment. You can install it from its toolbar.`,
    source: { label: 'Renor · Getting access', href: '/renor#access' },
  },
  {
    id: 'is-renor-free',
    title: 'Is Renor free? Do I need to pay?',
    keywords: ['free', 'cost', 'pay', 'payment', 'paid', 'trial', 'money', 'charge'],
    answer:
      'Yes. Renor is free to use while it is in preview, and the Free plan is open today. Pro, Plus and Max have proposed prices that are not approved yet, so nothing can be bought and nothing is charged.',
    source: { label: 'Plans', href: '/renor/plans' },
  },
  {
    id: 'plans-overview',
    title: 'What plans does Renor have and how much do they cost?',
    keywords: [
      'plans',
      'pricing',
      'prices',
      'price',
      'cost',
      'how much',
      'subscription',
      'monthly',
      'tiers',
      'compare',
    ],
    answer: `${PLANS.map(planLine).join(' ')} Every price is proposed: ${PAID_PLANS_NOTICE}`,
    source: { label: 'Plans', href: '/renor/plans' },
  },
  ...planEntries,
  ...planFaqEntries,
  {
    id: 'paid-plans-buy',
    title: 'Can I buy or upgrade to a paid plan now?',
    keywords: ['buy', 'upgrade', 'checkout', 'card', 'early list', 'waitlist', 'subscribe'],
    answer: `Not yet. ${PAID_PLANS_NOTICE} To hear when ${paid.map((plan) => plan.name).join(', ')} open, use “Join the early list” on the Plans page: it opens your email app, and no payment is taken.`,
    source: { label: 'Plans', href: '/renor/plans' },
  },
  {
    id: 'plugin-store',
    title: 'What is the Renor Plugin Store?',
    keywords: [
      'plugin store',
      'plugins',
      'store',
      'shop',
      'marketplace',
      'extensions',
      'templates',
      'kits',
      'products',
    ],
    answer: `The Renor Plugin Store lists ready-to-use digital products in three shelves: ${PLUGIN_CATEGORIES.map((category) => category.name).join(', ')}. The first products are the TradeLaunch kits for electricians, opening soon; nothing can be bought yet. Renor extensions are not listed yet and developer submissions are not open.`,
    source: { label: 'Plugin Store', href: '/plugins' },
  },
  ...pluginEntries,
  {
    id: 'plugin-buying',
    title: 'How does buying from the Plugin Store work? Refunds?',
    keywords: [
      'buy',
      'purchase',
      'refund',
      'policy',
      'delivery',
      'plug&pay',
      'plugandpay',
      'download',
    ],
    answer: `Nothing in the Plugin Store can be bought today. ${PURCHASE_NOTE} ${SEPARATE_FROM_PLANS} ${REFUND_NOTE}`,
    source: { label: 'Plugin Store · How buying works', href: '/plugins#buying' },
  },
  {
    id: 'privacy-website',
    title: 'What does this website collect? Privacy and cookies.',
    keywords: ['privacy', 'data', 'cookies', 'tracking', 'personal', 'gdpr', 'collect', 'ip'],
    answer:
      'The website saves your light or dark theme choice in your own browser, and the hosting provider receives standard request information such as your IP address. If anonymous visitor counting is switched on, it uses a random visitor ID with no name or account. FounderLab does not sell personal information and uses no advertising or cross-site tracking cookies.',
    source: { label: 'Privacy', href: '/privacy' },
  },
  {
    id: 'privacy-guide',
    title: 'What happens to what I type into this assistant or a report?',
    keywords: ['assistant', 'guide', 'messages', 'report', 'stored', 'log', 'chat history'],
    answer:
      'Your question is used to answer you and is not saved as a conversation on our servers. Server logs keep only a shortened copy of questions I could not answer, with emails, phone numbers and similar details removed. If AI answers are switched on, the question is also sent, with those details removed, to the AI provider that powers them. A report is stored privately for the FounderLab team, never posted publicly. By default only the type of problem and the page are kept; your description only if you tick “The Renor team may read my description”, with personal details removed first. Your email is kept only if you tick “Email me about this”. Reports are deleted automatically after 90 days.',
    source: { label: 'Privacy · This assistant', href: '/privacy#guide' },
  },
  {
    id: 'privacy-renor',
    title: 'How does Renor handle my data?',
    keywords: ['renor data', 'account data', 'stored', 'ai provider', 'delete', 'privacy'],
    answer:
      'Renor is a separate app you sign in to. It stores your account, projects, notes and settings so you can come back to them, and sends your requests to the AI provider you use. Renor’s full privacy terms will be published before any paid plan exists.',
    source: { label: 'Privacy · Renor', href: '/privacy' },
  },
  {
    id: 'data-requests',
    title: 'How do I ask for my data to be corrected or deleted?',
    keywords: ['delete my data', 'data request', 'correct', 'remove', 'erase', 'gdpr'],
    answer: `Email ${CONTACT_EMAIL} to ask about your data or to have it corrected or deleted.`,
    source: { label: 'Privacy · Questions and requests', href: '/privacy' },
  },
  {
    id: 'contact',
    title: 'How do I contact the FounderLab team?',
    keywords: [
      'contact',
      'email',
      'reach',
      'talk',
      'human',
      'person',
      'support',
      'help',
      'team',
      'partnership',
    ],
    answer: `Email ${CONTACT_EMAIL}: a person reads every message. You can also report a problem or request right here with “Report a problem”, and inside Renor use the Feedback button in its sidebar.`,
    source: { label: 'Contact', href: '/contact' },
  },
  {
    id: 'report-problem',
    title: 'How do I report a bug or request a feature?',
    keywords: ['bug', 'report', 'broken', 'issue', 'feature request', 'feedback', 'idea'],
    answer:
      'Use “Report a problem” in this panel: describe what happened, and you get a reference number straight away. It is stored privately for the team and never posted publicly. Tick “The Renor team may read my description” if you want them to see your words; otherwise only the type of problem and the page are kept. Inside Renor, the Feedback button in the sidebar sends a report with the context of what you were doing.',
    source: { label: 'Contact', href: '/contact' },
  },
  {
    id: 'about-founderlab',
    title: 'Who is FounderLab?',
    keywords: ['founderlab', 'company', 'about', 'who', 'founder', 'team', 'behind'],
    answer:
      'FounderLab is a small technology company that builds Renor, an AI workspace for people who make things, and a small family of related projects. It is early: Renor is in preview and the Plugin Store’s first products are not on sale yet.',
    source: { label: 'About', href: '/company' },
  },
  {
    id: 'company-legal',
    title: 'Is FounderLab a registered company? VAT, address or certifications?',
    keywords: [
      'registered',
      'registration',
      'company number',
      'vat',
      'tax',
      'legal',
      'address',
      'certified',
      'certification',
      'iso',
      'soc',
      'incorporated',
      'companies house',
    ],
    answer: `This website does not publish company registration, VAT, a legal address or certification details, so I can’t confirm any of them. For anything legal or business-related, email ${CONTACT_EMAIL}.`,
    source: { label: 'Contact', href: '/contact' },
  },
  {
    id: 'projects',
    title: 'What projects does FounderLab have?',
    keywords: ['projects', 'products', 'roadmap', 'status', 'company os', 'commerce lab'],
    answer: `${projectList}. Each project page shows its real status: live, preview, experimental, planned or research.`,
    source: { label: 'Projects', href: '/projects' },
  },
  {
    id: 'desktop',
    title: 'Is there a Renor desktop or mobile app download?',
    keywords: [
      'desktop',
      'download',
      'mac',
      'windows',
      'mobile',
      'ios',
      'iphone',
      'android',
      'app store',
    ],
    answer:
      'Renor for desktop is planned. A desktop build exists in development, but a public download will appear only after verified release files and a security review. Today Renor runs in your browser, and you can install it from its toolbar.',
    source: { label: 'Projects · Renor for desktop', href: '/projects#renor-desktop' },
  },
  {
    id: 'zero-to-prove',
    title: 'What is Zero to Prove?',
    keywords: ['zero to prove', 'build in public', 'journey', 'videos', 'youtube', 'tiktok'],
    answer: `Zero to Prove follows the founder of FounderLab building Renor in public: what was built, what broke, and what was actually proven. It is published on YouTube and TikTok, with every link on one page.`,
    source: { label: 'Zero to Prove', href: '/zero-to-prove' },
  },
  {
    id: 'latest-release',
    title: 'What is new? Latest Renor release.',
    keywords: ['new', 'latest', 'release', 'update', 'changelog', 'milestone', 'version'],
    answer: latest
      ? `Latest milestone (${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(latest.date))}): ${latest.title}. ${latest.detail}`
      : 'See the dated build log on Zero to Prove.',
    source: { label: 'Zero to Prove · Build log', href: '/zero-to-prove' },
  },
  {
    id: 'hire-founder',
    title: 'Can I hire the founder for freelance work?',
    keywords: ['hire', 'freelance', 'fiverr', 'work with', 'commission', 'agency'],
    answer: fiverr?.url
      ? `Yes: freelance work with the person who builds Renor is booked through Fiverr at ${fiverr.url}.`
      : `Email ${CONTACT_EMAIL} to ask about freelance work.`,
    source: fiverr?.url
      ? { label: 'Fiverr', href: fiverr.url }
      : { label: 'Contact', href: '/contact' },
  },
  {
    id: 'social',
    title: 'Where can I follow FounderLab and Renor? Social links.',
    keywords: ['follow', 'social', 'youtube', 'tiktok', 'links', 'channel', 'instagram', 'x'],
    answer: [
      youtube?.url ? `YouTube: ${youtube.url}` : null,
      tiktok?.url ? `TikTok: ${tiktok.url}` : null,
      links?.url ? `Every link on one page: ${links.url}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
    source: { label: 'Contact · Follow along', href: '/contact#follow' },
  },
  {
    id: 'accessibility',
    title: 'Is the website accessible? How do I report a barrier?',
    keywords: ['accessibility', 'a11y', 'screen reader', 'keyboard', 'wcag', 'barrier'],
    answer: `The website aims for WCAG 2.2 level AA but has not had a formal independent audit, so full conformance is not claimed. Keyboard use, focus rings, phone layouts, light and dark themes and reduced motion have been checked. Report a barrier to ${CONTACT_EMAIL}.`,
    source: { label: 'Accessibility', href: '/accessibility' },
  },
  {
    id: 'terms',
    title: 'What are the terms of use?',
    keywords: ['terms', 'conditions', 'tos', 'licence', 'license', 'legal terms'],
    answer:
      'The Terms page covers using this website. Renor is offered as a preview that may change or make mistakes, so check AI output before relying on it. Terms for Renor accounts and Plugin Store sales, including refunds, will be published before they apply.',
    source: { label: 'Terms', href: '/terms' },
  },
  {
    id: 'own-key-models',
    title: 'Which AI models does Renor use? Can I use my own key or a local model?',
    keywords: ['model', 'models', 'api key', 'own key', 'byok', 'openai', 'gemini', 'local'],
    answer: `Renor works with the AI providers configured for your account, or your own key. ${area('chat').limits}`,
    source: { label: 'Renor · Chat AI', href: '/renor#chat' },
  },
  {
    id: 'about-guide',
    title: 'Who am I talking to? Are you a person?',
    keywords: ['who are you', 'are you human', 'are you real', 'assistant', 'guide', 'ai'],
    answer:
      'I’m the Renor Guide, an AI assistant on the FounderLab website. I answer only from this website’s pages and link the page each answer comes from. When I don’t know, I pass your question to the team.',
    source: { label: 'Contact', href: '/contact' },
  },
];

/** Look an entry up by id. */
export function knowledgeEntry(id: string): KnowledgeEntry | undefined {
  return KNOWLEDGE.find((entry) => entry.id === id);
}
