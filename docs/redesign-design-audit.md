# Redesign audit and creative recommendation

Pre-implementation design audit, self-authored under explicit creative delegation. The final palette, devices and verification are recorded in `redesign-verification.md` and `scrollcraft/builds/senior-portfolio/BRIEF.md`; recommendations below are the original diagnosis, not instructions for the completed build.

## Evidence and diagnosis

- The canonical data already positions Ivan as `Senior Animator / Animation Lead · Compositing · VFX`. `HeroSection.tsx` currently ignores that title and substitutes `Animation · Compositing · VFX`, weakening the senior signal at the one point every visitor sees.
- The two existing biography paragraphs explicitly establish team leadership, standards, polished delivery, international productions, and deadline responsibility. They are currently hidden behind an ABOUT disclosure. Make this existing proof directly readable in the natural reading path.
- `Dopamine (Red Tiger)` is the current role and contains five existing leadership/production highlights. Treat the current entry as a major piece of professional evidence through space and typography, while keeping every earlier role and all dates, links, tags, and descriptions.
- Portfolio work currently receives uniform two-column cards. This gives a reel, a music video, a short film, series credits, and a large production collection equal visual treatment. The work has sufficient visual specificity to support a stronger media-led rhythm without changing content or attribution.
- The portrait is a small supplied square headshot, not an environmental photograph or genuine cutout. Avoid pretending it is an extracted cinematic subject. A rectangular framed portrait is honest and more professional than the large circular avatar.
- The supplied showreel still is a low-resolution illustrated frame with letterboxing. It can serve a smaller contact-sheet tile or a carefully cropped medium-sized preview; stretching it across a giant hero will expose its limitations.
- The Red Tiger poster sources are landscape splash images (URLs explicitly indicate 2560 × 820), but existing cards use 3:4 crops. This loses most of the actual artwork. Present them at a landscape ratio or a crop validated against each frame.
- The Red Tiger collection uses a wheel handler on its entire shell to intercept vertical scroll and move a horizontal rail. That makes the recruiter's basic scrolling behavior unpredictable. Use native horizontal scrolling, explicit buttons, and visible rail affordance; keyboard focus must scroll the active link into view.
- Existing motion applies glow, shines, motes, breathing, tilt, reveal, and elevation across many surfaces. None communicates production judgment by itself. Restraint and exact timing will better demonstrate the subject's craft.
- An existing full-page QA artifact contains large blank content regions because entry animation had not revealed the sections before capture. This is a verification warning and an implementation resilience warning: semantic information should be visible by default, and progressive effects must not depend on a scroll observer firing to make it readable.

## Design direction: an editorial production desk

A portfolio dossier that borrows the precision of a reel editor's desk: confident oversized type, quiet technical rules, warm paper for reading, near-black for the work, and a controlled orange-red action color. Actual production stills supply the color. The design should make a creative director feel the page was composed by someone who understands hierarchy and timing.

This is a named custom grammar, combining editorial chapters with an inspectable contact sheet. Its constraints are:

1. The title and professional role remain on the first viewport as semantic text.
2. Existing media and factual captions supply visual interest; no invented project breakdowns, achievements, clients, availability, statistics, or generated “portfolio work.”
3. The primary work encounter precedes dense CV material; every section remains reachable from concise navigation.
4. A dark media encounter earns the only visual peak. Administrative information stays in compact natural flow.
5. The ending is a calm contact plate with actual email, location, and existing contact links. The trademark note and admin route stay accessible.
6. Recruiters can inspect all content at their own pace; no scroll trap, mandatory autoplay, or long empty pin.

The eight prescribed grammars each lose something here: filmic one-shot overstates the available assets; chapters alone risk looking like a restyled CV; live surface implies operating data; object diorama requires invented scene assets; typographic instrument minimizes evidence; pure catalog gives too little hierarchy to seniority; split stage implies a comparison not present in the data; rhythmic cutlist is too hurried for a hiring decision. The custom desk grammar retains editorial substance while making the actual work directly inspectable.

## Four device families

| Family | Purpose | Concrete use |
| --- | --- | --- |
| Parallax | Depth belongs to the professional material | Independent hero planes: a far dark work plate, a middle framed still, a near contact-sheet edge/portrait frame. Keep all essential type stable and movement under roughly 24 pixels. |
| Kinetic | Give unchanged senior positioning deliberate timing | One short line-mask entrance on the existing hero role. Do not split ordinary paragraphs or animate every heading. Opening text is readable immediately. |
| Reveal | Let finished work resolve cleanly | A restrained clip-path opening for the primary projected source still, after the quiet biography. Use a complete static still in reduced motion. |
| Flow + in | Reward reading without spending patience | Skills, full experience, languages, education, and contact use subtle once-only entry rises, with default visible content and reduced-motion opacity of 1. |

The optional native collection pan is a fifth family. Do not manufacture counters: dates and the verified episode count are factual labels, not reasons to invent animated career totals. Adjacent sections should have visibly different behaviors, and no behavior should compete with the reel encounter.

## Hero layer contract

| Plane | Content | Movement | Rule |
| --- | --- | --- | --- |
| Far | A real portfolio still in a large bounded frame | Smallest translation | Remains a framed source image, never a fake clean plate |
| Middle | A second smaller actual work frame | Opposite small translation | Overlaps the far frame to create perspective without obscuring copy |
| Focal professional identity | Existing name, exact role, subtitle | Stable | Senior and lead words legible on first view |
| Near | Supplied rectangular portrait and a contact-sheet edge | Largest restrained translation | Whole face remains visible, no counterfeit transparency |
| Atmosphere | A subtle rule/grid, if it supports the desk metaphor | Static | No unrelated dust, fake film noise, or glow |
| Controls | Existing navigation, experience/contact paths, actual showreel link | Stable | Clear focus rings, 44-pixel targets, and no pointer capture |

Opening: the name and senior role are immediately legible beside spatially separated work frames. Midpoint: framed source media shifts at distinct rates while the biography begins to take the reading foreground. Exit: the hero resolves into a straight, aligned work desk, so the page moves from professional identity to observable work.

On mobile, set name/role first, then one principal framed still and a smaller portrait. Remove secondary frame travel rather than shrinking every desktop element. Check 390 × 844 and 360 × 640 for full title, portrait, safe crops, and available controls. Reduced motion uses the same complete composition with no sticky extension.

## Signature: the inspectable reel desk

A bespoke contact-sheet projector turns the six existing individual projects into an inspectable reel without suggesting that still images are footage. An accessible range control or explicit previous/next controls move a selection along the actual six source frames; the large projector resolves to the selected thumbnail and repeats only the unchanged title, year, category, descriptor, and original link. The selected contact-sheet tile stays visibly connected to the projection.

Every original project remains in the page in its documented order. The desk supplements direct project access rather than filtering work out of existence. Range input supports keyboard arrows/Home/End, has a meaningful current project value, and does not steal wheel scroll. On touch, actual selection controls remain available. Under reduced motion, selections swap immediately.

Tell-someone sentence: “It's the site where I could inspect his work like an editor's contact sheet, then open the exact production from the same frame.”

The peak is the projector resolving a selected production out of the quiet biography interval. This is useful agency tied to the hiring task, not a renamed tilt or spotlight. It uses no generated frames, invented process illustrations, inferred role mappings, or fabricated before/after comparisons.

## Feeling curve and proof

| Beat | Intended feeling | Cause |
| --- | --- | --- |
| Professional opening | Confidence | Large exact senior/lead role and controlled source-media composition |
| Biography | Trust | Existing paragraphs about standards, teams, and delivery made directly readable |
| Inspectable work desk | Curiosity, then delight | Actual contact-sheet selection visibly resolves the projected work; this is the single peak |
| Red Tiger collection | Scale | Actual production breadth and supplied artwork, with complete game access |
| Skills and full career | Assurance | Clear skills matrix and precise dates, responsibilities, and links |
| Education and languages | Calm | Compact readable factual ledger |
| Contact plate | Readiness | Real email and destinations, stable concluding composition |

Author no empty viewport. Whitespace around the biography is reading space with visible material, not silent dead scroll. Do not extend pinned scenes simply to meet a nominal viewport-height quota.

## Preservation and verification priorities

- Leave `src/data/cvData.ts` unchanged. Preserve nine experience entries, seven portfolio entries including the full Red Tiger collection, all five skill sections, all personal skills, four languages and their proficiency levels, two education records, biography text, all destinations, and footer notices.
- Existing em dashes, trademark marks, and wording are user-owned content. The user's explicit information-preservation request takes priority over the skill's visible-punctuation preference.
- Preserve the data context/editor and published-CV integration. Do not hardcode Ivan's data into redesigned components in a way that breaks current editing.
- Keep all source images intact. New generated scenery could imply work Ivan did not make and is unnecessary for this redesign.
- Capture initial, intermediate, and resolved hero states; work selection states; collection scroll/focus states; dense CV rows; and the final contact plate on desktop, typical phone, compact phone, and reduced motion.
- Test every real control and original destination, image failure fallback, keyboard progression, focus visibility, horizontal overflow, header offsets, and console/network errors.
- Run the repository's lint, typecheck, test, and build gates. Inspect the actual final build package rather than accepting earlier screenshots as evidence.
- A headless mobile pass verifies composition and interaction, not the behavior of a real phone's decoder. This plan avoids a mandatory video decoder entirely because existing portfolio footage remains at its original destinations.
