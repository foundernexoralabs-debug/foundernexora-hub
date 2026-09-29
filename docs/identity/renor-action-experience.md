# Renor action experience — public-facing concept, not a shipping claim

Renor aims to be a focused, human-controlled AI workspace that can understand a user's intent, route the task to the right permissioned tool, execute an authorised action and show verifiable results in the same conversation.

## Experience contract
1. Discover: suggest only relevant integrations contextually; make connection optional, with an ordinary text alternative when possible.
2. Connect: disclose provider, requested scopes, expiry/revocation and which account is being linked. No master API keys pasted into chat or committed to Git.
3. Plan: show requested action, impact and which real connector/provider will execute it. Distinguish preview from live changes.
4. Approve: read-only tasks can proceed within granted scopes; publishing, spending, external messages, deletion, refunds and deployment require granular confirmation.
5. Execute: use a server-owned adapter with provider-specific auth, rate limiting, validation, retries and idempotency. Use smaller permissioned tools rather than creating a giant all-in-one integration.
6. Prove: display actual returned action result and a dated receipt (scope, resource, success/failure, next steps). Never fabricate a screenshot, deployment, sale, test or completed work.
7. Resume: persist task state using isolated scope-specific memory, not cross-customer conversation leakage; permit user revoke/export.

## Candidate first connectors
- Existing GitHub workflow: read repository → plan → safe branch → code review → tested PR; no direct main merges without gates.
- Shopify (proposed): store profile, product research context and read-only performance first; sensitive writes behind approvals.
- Future: provider adapters for media/YouTube, email and productivity tools when contracts and evidence justify them.

## Operating posture
Renor is a product, not an uncontrolled chain of external agents. Claude Code can handle high-effort engineering in the designated work lane; Codex can review and test; an owner-approved coordinator can route tasks. Agent-to-agent messages need identity, scope, work-order ID, checkpoint and audit trail. Provider availability and integration limits must never be misrepresented.

**Status:** design intent. Publish only verified features on the main product page.
