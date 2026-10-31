// @vitest-environment node
// @polsia:user-owned — retrieval grounding: real questions find the right page, and questions the
// site cannot answer find nothing (so the Guide says it doesn't know instead of guessing).
import { describe, expect, it } from 'vitest';
import {
  ANSWER_THRESHOLD,
  retrieve,
  tokenize,
} from '../../src/lib/business/receptionist/retrieval';

const top = (question: string) => {
  const [hit] = retrieve(question, 1);
  return hit && hit.score >= ANSWER_THRESHOLD ? hit.entry.id : null;
};

describe('retrieval grounding', () => {
  it.each([
    ['What is Renor?', 'about-renor'],
    ['How much are the plans?', 'plans-overview'],
    ['what does renor cost', 'plans-overview'],
    ['What is in the Plugin Store?', 'plugin-store'],
    ['How do I get started?', 'getting-started'],
    ['How do I sign in', 'getting-started'],
    ['is renor free', 'is-renor-free'],
    ['can I buy plus now', 'paid-plans-buy'],
    ['what is an AI credit', 'plan-faq-1'],
    ['when do credits reset', 'plan-faq-2'],
    ['is it unlimited', 'plan-faq-5'],
    ['refund policy', 'plugin-buying'],
    ['electrician kit price', 'plugin-tradelaunch-electrician-business-kit'],
    ['is there a desktop app', 'desktop'],
    ['Do you have an iPhone app?', 'desktop'],
    ['who is founderlab', 'about-founderlab'],
    ['are you VAT registered', 'company-legal'],
    ['company registration number', 'company-legal'],
    ['can I hire the founder', 'hire-founder'],
    ['what is zero to proof', 'zero-to-proof'],
    // The old misspelling still finds the series.
    ['what is zero to prove', 'zero-to-proof'],
    ['does it do python', 'renor-code'],
    ['can it build a website for my business', 'renor-builder'],
    ['can I use my own api key', 'own-key-models'],
    ['How do I contact the team?', 'contact'],
    ['how do I report a bug', 'report-problem'],
    ['can I delete my data', 'privacy-renor'],
    ['what happens to my messages', 'privacy-guide'],
    ['is the site accessible', 'accessibility'],
    ['what are the terms', 'terms'],
    ['what is new', 'latest-release'],
  ])('“%s” → %s', (question, id) => {
    expect(top(question)).toBe(id);
  });

  it.each([
    'what is the capital of France',
    'write me a poem about cats',
    'who won the world cup',
    'what is the weather today',
    'tell me a joke',
    'best laptop to buy',
    'how to buy a car',
    'can you help me with my homework',
    'translate this to french',
    'who is the president',
    'stock price of apple',
    'recipe for pancakes',
    '',
    '???',
  ])('finds nothing to answer “%s” with', (question) => {
    expect(top(question)).toBeNull();
  });

  it('tokenises with light stemming and no stopwords', () => {
    expect(tokenize('How much do the Plans cost?')).toEqual(['plan', 'cost']);
  });
});
