# Renor in 60 seconds — film storyboard

The shot list for Renor's 60-second launch film. The same storyboard is published at
[/launch-kit/storyboard](/launch-kit/storyboard) and both come from `STORYBOARD` in
`src/lib/business/launch.ts` (a unit test keeps this file in step with it).

- **Length:** 60 seconds, 7 shots. Record at 1920 × 1080, 30 fps.
- **Source:** every app shot is recorded from the real Renor app. No mocked screens.
- **Example:** Larkspur Cycles, a two-person bike workshop we invented for this tour. Say on screen, at least once, that it is invented.
- **Voice-over:** about 2.4 words a second, with a beat of silence at each cut.
- **No prices** in the film: paid plans are proposals until billing is approved.

| Time | Shot | Real screen | On screen | Voice-over |
| --- | --- | --- | --- | --- |
| 0:00–0:05 | Cold open | Renor Chat, empty state with the orb | “One workspace.” | “What if one workspace could think, build and keep it all?” |
| 0:05–0:14 | Ask | Chat: the Larkspur Cycles question and answer | “Ask anything. Get a plan you can use.” | “Meet Renor. Ask a real question about your work and get an answer you can act on today.” |
| 0:14–0:26 | Build an app | Code AI: the repair queue build, then its live preview | “Describe it. Watch it run.” | “Describe an app and Code AI writes it, runs it in a live preview, and checks it against what you asked for.” |
| 0:26–0:38 | Build a website | Website Builder: live preview filling in, then the saved site | “Your facts. Your website.” | “Give it your real prices and hours, and the Website Builder writes the site in front of you.” |
| 0:38–0:46 | Keep it | Projects room with both projects | “Everything you make, in one place.” | “Everything you make lands in Projects, ready to pick up where you left off.” |
| 0:46–0:53 | Talk to it | Chat live call, then Plan & usage | “Talk, listen, and see your usage.” | “Talk to it out loud, choose your model, and always see where you stand.” |
| 0:53–1:00 | End card | Brand end card (graphic, not an app screen) | “Renor by FounderLab. Join the private beta.” | “Renor, by FounderLab. Join the private beta.” |

## Shot by shot

### 1. Cold open (0:00–0:05, 5 s)

- **Screen:** Renor Chat, empty state with the orb — reference: `public/assets/renor/orb.webp`
- **Action:** Black frame. The orb fades in and breathes once. Slow push in towards the message box.
- **On screen:** “One workspace.”
- **Voice-over:** “What if one workspace could think, build and keep it all?”

### 2. Ask (0:05–0:14, 9 s)

- **Screen:** Chat: the Larkspur Cycles question and answer — reference still: `public/assets/renor/tour/chat-dark.webp`
- **Action:** The question is typed in real time. The answer streams in; hold on the comparison table.
- **On screen:** “Ask anything. Get a plan you can use.”
- **Voice-over:** “Meet Renor. Ask a real question about your work and get an answer you can act on today.”

### 3. Build an app (0:14–0:26, 12 s)

- **Screen:** Code AI: the repair queue build, then its live preview — reference still: `public/assets/renor/tour/code-dark.webp`
- **Action:** Brief pasted, Run Build pressed. Files appear one by one; cut to the preview. Click “Put in the stand” and the totals update. Zoom on the Verified badge.
- **On screen:** “Describe it. Watch it run.”
- **Voice-over:** “Describe an app and Code AI writes it, runs it in a live preview, and checks it against what you asked for.”

### 4. Build a website (0:26–0:38, 12 s)

- **Screen:** Website Builder: live preview filling in, then the saved site — reference still: `public/assets/renor/tour/builder-live-dark.webp`
- **Action:** The brief with real prices and hours. Approve the plan. The page fills in file by file; the styles land and the site comes alive. Switch between desktop and phone size.
- **On screen:** “Your facts. Your website.”
- **Voice-over:** “Give it your real prices and hours, and the Website Builder writes the site in front of you.”

### 5. Keep it (0:38–0:46, 8 s)

- **Screen:** Projects room with both projects — reference still: `public/assets/renor/tour/projects-dark.webp`
- **Action:** Pull back to Projects. Both cards slide in. Open the app straight from its card.
- **On screen:** “Everything you make, in one place.”
- **Voice-over:** “Everything you make lands in Projects, ready to pick up where you left off.”

### 6. Talk to it (0:46–0:53, 7 s)

- **Screen:** Chat live call, then Plan & usage — reference still: `public/assets/renor/tour/plan-dark.webp`
- **Action:** Tap Live call; the orb reacts as the voice answers. Quick cut to Plan & usage showing the weekly credits.
- **On screen:** “Talk, listen, and see your usage.”
- **Voice-over:** “Talk to it out loud, choose your model, and always see where you stand.”

### 7. End card (0:53–1:00, 7 s)

- **Screen:** Brand end card (graphic, not an app screen) — reference: `public/assets/renor/orb.webp`
- **Action:** The orb settles above the wordmark. The website address and “Join the private beta” fade up.
- **On screen:** “Renor by FounderLab. Join the private beta.”
- **Voice-over:** “Renor, by FounderLab. Join the private beta.”

## Short descriptions

- **25 words:** Renor by FounderLab is an AI workspace for conversations, coding, websites and ongoing projects. It builds apps and sites, checking them before calling them done.
- **50 words:** Renor by FounderLab is an AI workspace where conversations, code, websites and projects live together. Ask a question and get an answer with sources, describe an app and watch it run, or turn your own facts into a website. Every build is checked against your brief, then kept in Projects.
- **100 words:** Renor by FounderLab is an AI workspace for people who make things. Chat handles files and research with sources, and can read answers aloud or hold a live call. Code AI builds multi-file apps, runs them in a live preview and checks each build against the brief before it is called done. The Website Builder writes a site from your real prices, hours and services. Projects keeps every site and app in one place, alongside Notes and Tasks. You choose the model, from Gemini and Groq to a local engine or your own key. Renor is free while in preview.
