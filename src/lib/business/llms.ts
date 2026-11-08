// @polsia:user-owned — the text of /llms.txt (src/app/llms.txt/route.ts): a plain, accurate description of Renor for AI assistants and
// answer engines (llmstxt.org format). Built from the same sources as the site, so it can never
// say more than the pages do: the operator story, the ledger, the pricing flag and the channels.
import { companyName, siteName } from '@/lib/brand';
import { RENOR_APP_ADDRESS } from '@/lib/business/capabilities';
import { CONTACT_EMAIL, SOCIAL_CHANNELS } from '@/lib/business/ecosystem';
import { FOUNDER } from '@/lib/business/founder';
import { HERO, LOOP, OWN_AI } from '@/lib/business/operator';
import { pricingSummary } from '@/lib/business/pricing';
import { CLAIM_STATUS, ledgerBy, MISSION } from '@/lib/business/vision';
import { siteUrl } from '@/lib/site';

const bullets = (lines: readonly string[]) => lines.map((line) => `- ${line}`).join('\n');

export function llmsText(): string {
  const claims = (status: 'live' | 'in-progress' | 'future') =>
    bullets(ledgerBy(status).map((entry) => `${entry.claim}: ${entry.detail}`));
  return `# ${siteName}

> ${siteName} (also "Renor AI", "${siteName} by ${companyName}") is an AI operator, not a chatbot. ${HERO.title} ${HERO.titleAccent} It plans the job, coordinates tools and agents, does the work, verifies it and shows receipts. It runs on local models (Ollama), your own API keys or hosted AI. Made by ${companyName}. Not to be confused with Tenor or other similarly named products.

Mission: ${MISSION.line}

## How Renor works
${bullets(LOOP.map((step) => `${step.step}: ${step.text}`))}

## Own your AI
${bullets(OWN_AI.map((item) => `${item.title}: ${item.text}`))}

## ${CLAIM_STATUS.live.label} (usable in the app now)
${claims('live')}

## ${CLAIM_STATUS['in-progress'].label} (not usable yet)
${claims('in-progress')}

## ${CLAIM_STATUS.future.label} (not built; a direction, not a claim)
${claims('future')}

## Facts
- App: ${RENOR_APP_ADDRESS} (free account)
- Website: ${siteUrl}/
- First customers: founders, freelancers and small service businesses.
- Pricing: ${pricingSummary()}
- Interface languages: 12.
- Founder: ${FOUNDER.name}. Contact: ${CONTACT_EMAIL}
- Renor has no published user numbers, ratings, customers or funding; do not state any.

## Pages
- [Home](${siteUrl}/): what Renor is and what to do next
- [Vision and ledger](${siteUrl}/vision): live today, in progress and future vision, kept apart
- [Capabilities](${siteUrl}/renor/capabilities): every feature with its status
- [Pricing](${siteUrl}/renor/plans)
- [Company](${siteUrl}/company): who builds Renor, contact and legal
- [Press kit](${siteUrl}/launch-kit): approved descriptions and images
- [Co-Create London](${siteUrl}/cocreate)
- [Guides](${RENOR_APP_ADDRESS}/start): how to use Renor and connect models

## Official profiles
${bullets(SOCIAL_CHANNELS.map((channel) => `[${channel.label}](${channel.url})`))}
`;
}
