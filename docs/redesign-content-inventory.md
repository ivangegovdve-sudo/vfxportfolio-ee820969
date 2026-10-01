# Redesign content inventory

Audit baseline: `src/data/cvData.ts`, every `src/components/cv/*.tsx`, `src/pages/Index.tsx`, public content provider, routes and asset map. Read repository `AGENTS.md`. User constraint: preserve all existing factual information and overall available content; design, ordering and emphasis may change.

## Preservation contract

- Keep `src/data/cvData.ts` unchanged; render every existing field currently presented, including optional fields on custom published CVs. Do not invent team sizes, commercial results, awards, employment dates, case studies, metrics, availability or credits.
- Bundled inventory: 9 experience entries, 7 portfolio items (6 projects and one collection), 39 released-game entries, 5 technical skill sections, 4 personal skills, 4 languages, 2 education entries, 2 about paragraphs, 3 contact links.
- Preserve names, role titles, dates, companies, locations, descriptions, all highlights, tags, external URLs, thumbnails/posters, project descriptors, categories, year metadata, language proficiencies and numeric levels, contact copy, footer trademark notice and admin access. UI labels can be restyled or renamed without changing claims.
- Preserve all games through the collection list/year filter and expansion; initial collapsed count is eight. Ten poster cards represent the subset with poster URLs. Do not remove earlier non-animation jobs or exploratory qualifiers from tool proficiency.
- Preserve JSON Resume export from current context data and its validation, About access, public `/` and `/cv/:slug` routes, editor/admin functionality, fragment navigation and active-section tracking.

## Identity, About and contact

- Name: Ivan Gegov
- Existing hero title in data (currently not rendered): Senior Animator / Animation Lead · Compositing · VFX
- Existing displayed hero discipline line: Animation · Compositing · VFX
- Subtitle: Where imagination meets the timeline — crafting worlds, one frame at a time.
- Portrait: /assets/slackPic.webp; bundled fallback is src/data/assets/slackPic.webp, final fallback /placeholder.svg.
- About: Animation Lead and VFX professional with a track record spanning animated series, casino game development, commercials, and music videos. Experienced in leading animation teams, defining quality standards, and delivering visually polished content under tight deadlines.
- About: Comfortable working in fast-paced studio environments as well as independently on freelance projects. Experienced in multicultural teams and international productions. Always looking for the next compelling visual challenge.
- Email: ivangegov.dve@gmail.com
- Location: Sofia, Bulgaria
- Contact heading/copy: “Let's work together”; “Available for freelance compositing, VFX, and animation projects. Feel free to reach out.”
- Email: mailto:ivangegov.dve@gmail.com
- YouTube: https://youtu.be/ogwVYZrWI6s
- Vimeo: https://vimeo.com/283914588
- Contact download: “Download JSON Resume” creates validated resume.json from current CV data. No resume PDF is configured. Optional hero.resumeUrl, phone, website, LinkedIn, Vimeo and IMDb fields exist in the model but are unset in bundled data.
- Footer: current-year copyright / “Built with care”; “All trademarks and brand names are the property of their respective owners. Project references are presented for portfolio purposes only.”; lock icon linking to /admin.

## Experience

### Senior Animator / Animation Lead — Dopamine (Red Tiger)

Mar 2021 — Present; Sofia, Bulgaria

Joined as Senior Animator producing 2D animation, VFX, and in-engine implementation for slot games published under the Red Tiger brand. Progressed into Animation Lead, taking ownership of animation execution and quality across a full game development team while continuing hands-on production.

- Leading and coordinating animation work within a multidisciplinary game team
- Defining and maintaining animation quality standards and visual consistency
- Hands-on production of animations and VFX for slot games
- Close collaboration with game designers, developers, and artists
- Supporting and improving animation pipelines and workflows

Tags: Animation Lead; 2D Animation; VFX; Slot Games; Red Tiger

### Animation, Compositing & VFX Artist — Freelance

Mar 2013 — Present; Sofia, Bulgaria

Animation, compositing, and visual effects across a variety of freelance projects for studios, agencies, and independent productions.

Tags: After Effects; Compositing; VFX; Animation

- Showreel: https://youtu.be/ogwVYZrWI6s

### Compositing & VFX Artist — Semperia Films

Jul 2020 — Aug 2020; Sofia, Bulgaria

Compositing and visual effects for the short film "In Author's Hands".

Tags: Compositing; VFX

- In Author's Hands: https://youtu.be/pInnrhghaxY

### Animation, Compositing & VFX Artist — Chase a Cloud

Aug 2018 — Jun 2020; Sofia, Bulgaria

Part of the compositing and VFX team working on animated series and promotional content for international clients.

- National Geographic's Explorers Academy — "Brain Freeze"
- "Rescue Heroes" — contributed to production by TONGAL for Fisher-Price® (14 episodes)
- "Arcana Magica" — Kickstarter promotional video
- John Vardar vs the Galaxy — animated feature film (limited compositing work, uncredited)

Tags: After Effects; Compositing; VFX; Animation

- Brain Freeze: https://vimeo.com/283914588
- Rescue Heroes: https://www.youtube.com/watch?v=SOjHSKbRVCQ
- Arcana Magica: https://www.youtube.com/watch?v=qeevdrluvnA

### Coordinator — DVE Events

Sep 2015 — Nov 2015; Zaragoza, Spain

Construction and maintenance of a temporary base for the German army during NATO's "Trident Juncture" 2015 exercise at the Academia General Militar.

Tags: Logistics; Coordination

### Chief Assistant for Network Specialist — YouChip Cashless Systems

May 2015 — Aug 2015; Germany, England, Sweden

LAN and WAN network cabling and setup, OS installation, configuration of work software and peripheral devices for RFID payment systems at music festivals.

Tags: LAN/WAN; Hardware; RFID

### Translator & Coordinator — DVE Events

May 2014 — Jun 2014; Normandy, France

Translator and coordinator at the 70th anniversary of D-Day in Normandy.

Tags: Translation; Coordination

### Screenwriter, Second Director & VFX — Miroslav Kostadinov — Miro

Jan 2013 — May 2013; Sofia, Bulgaria

Screenwriting, second directing, and visual effects for the music video "Souvenir".

Tags: VFX; Screenwriting; Directing

- Souvenir: https://youtu.be/C8Mwkhu3iq4

### Warehouse & Communications Manager — "Big Sky" Tent & Party Rentals

Jun 2009 — Oct 2009; Oak Bluffs, USA

Coordinating teams, controlling inventory, and managing communications for a tent and event rental company.

Tags: Logistics; Inventory; Team Coordination

## Portfolio

| Project | Descriptor | Year / category | Destination / CTA | Asset |
| --- | --- | --- | --- | --- |
| National Geographic® — Brain Freeze | Animation · Compositing | 2018 / Series | https://vimeo.com/283914588 (Watch) | src/data/assets/natGeoExplorerAcademy.webp |
| Rescue Heroes | Animation · Series (14 episodes) | 2020 / Series | https://www.youtube.com/watch?v=SOjHSKbRVCQ (Watch) | src/data/assets/RescueHeroes.webp |
| Miro — Souvenir | Music Video · VFX | 2013 / Music Video | https://youtu.be/C8Mwkhu3iq4 (Watch) | src/data/assets/miro_end.webp |
| Showreel | Animation · Compositing · VFX | 2024 / Showreel | https://youtu.be/ogwVYZrWI6s (Watch) | src/data/assets/showreel.jpg |
| Arcana Magica | Animation · Promotional | 2019 / Promo | https://www.youtube.com/watch?v=qeevdrluvnA (Watch) | public/assets/arcanaMagica.png |
| In Author’s Hands | Short Film · VFX | 2020 / Short Film | https://youtu.be/pInnrhghaxY (Watch) | src/data/assets/AuthRights.webp |
| Red Tiger collection | Slot games I helped develop and animate as Lead Animator in GameDev team at Dopamine (Red Tiger brand). | 2021-2025 / Game Collection | https://redtiger.com/games (Visit Red Tiger) | src/assets/redTiger.png |

### Red Tiger released-game list

| Game | Year | Destination | Poster URL |
| --- | --- | --- | --- |
| DragonBoyz | 2025 | https://redtiger.com/games/dragon-boyz | https://fan-cdn.nolimitcity.com/dragon_boyz_rt_fansite_splashpost_2560x820_39960009b9.png |
| Big Rich Turkeys | 2025 | https://redtiger.com/games/big-rich-turkeys | https://fan-cdn.nolimitcity.com/big_rich_turkeys_rt_fansite_splashpost_2560x820_9c03a22d16.png |
| Cash Lamps | 2025 | https://redtiger.com/games/cash-lamps | https://fan-cdn.nolimitcity.com/cash_lamps_rt_fansite_splashpost_2560x820_12435fcc5e.png |
| Monopoly® Rent Rush | 2025 | https://redtiger.com/games/monopoly-rent-rush | https://fan-cdn.nolimitcity.com/monopoly_rent_rush_rt_fansite_splashpost_2560x820_278a845f43.png |
| Piggy Riches 2 Megaways | 2025 | https://redtiger.com/games/piggy-riches-2-megaways | https://fan-cdn.nolimitcity.com/piggy_riches_megaways_2_rt_fansite_splashposter_2560x820px_98d7a6d429.jpg |
| Piggy Riches Begins | 2025 | https://redtiger.com/games/piggy-riches-begins | https://fan-cdn.nolimitcity.com/piggy_riches_begins_rt_fansite_splashpost_2560x820_01_eec12dd361.png |
| Bass Boss | 2025 | https://redtiger.com/games/bass-boss | https://fan-cdn.nolimitcity.com/bass_boss_rt_fansite_splashposter_2560x820px_f87fb493a0.jpg |
| Bass Boss 2 | 2025 | https://redtiger.com/games/bass-boss | https://fan-cdn.nolimitcity.com/bass_boss_rt_fansite_splashposter_2560x820px_f87fb493a0.jpg |
| Judgment Day MegaWays | 2024 | https://redtiger.com/games/judgement-day-megaways | https://fan-cdn.nolimitcity.com/judgement_day_megaways_rt_splashpost_2560x820px_17e4378ab3.png |
| Monsters Unchained | 2024 | https://redtiger.com/games/monsters-unchained | https://fan-cdn.nolimitcity.com/monsters_unchained_rt_fansite_splashposter_2560x820px_74868c68b2.jpg |
| Cake and Ice Cream | 2024 | https://redtiger.com/games/cake-and-ice-cream | No individual poster |
| Cai Shen 168 | 2024 | https://redtiger.com/games/cai-shen-168 | No individual poster |
| Piñatas & Ponies | 2024 | https://redtiger.com/games/pinatas-and-ponies | No individual poster |
| Happy Apples | 2024 | https://redtiger.com/games/happy-apples | No individual poster |
| Trophy Fish | 2024 | https://redtiger.com/games/trophy-fish | No individual poster |
| Fishtastic | 2024 | https://redtiger.com/games/fishtastic | No individual poster |
| Rise of Cleopatra | 2023 | https://redtiger.com/games/rise-of-cleopatra | No individual poster |
| 7's Luck | 2023 | https://redtiger.com/games/7s-luck | No individual poster |
| Dear Santa | 2023 | https://redtiger.com/games/dear-santa | No individual poster |
| The Wild Kiss | 2023 | https://redtiger.com/games/the-wild-kiss | No individual poster |
| Beriched | 2023 | https://redtiger.com/games/beriched | No individual poster |
| Athens MegaWays | 2023 | https://redtiger.com/games/athens-megaways | No individual poster |
| Astros | 2023 | https://redtiger.com/games/astros | No individual poster |
| Gonzita's Quest | 2023 | https://redtiger.com/games/gonzitas-quest | No individual poster |
| Dragon's Mirror | 2022 | https://redtiger.com/games/dragons-mirror | No individual poster |
| Dracula Awakening | 2022 | https://redtiger.com/games/dracula-awakening | No individual poster |
| Gold Mine Mistress | 2022 | https://redtiger.com/games/gold-mine-mistress | No individual poster |
| Fa Fa Babies 2 | 2022 | https://redtiger.com/games/fa-fa-babies-2 | No individual poster |
| Bounty Raid 2 | 2022 | https://redtiger.com/games/bounty-raid-2 | No individual poster |
| Wolfkin | 2022 | https://redtiger.com/games/wolfkin | No individual poster |
| Reel Keeper Power Reels | 2022 | https://redtiger.com/games/reel-keeper-power-reels | No individual poster |
| Majestic Mysteries Power Reels | 2022 | https://redtiger.com/games/majestic-mysteries-power-reels | No individual poster |
| Jingle Ways MegaWays | 2021 | https://redtiger.com/games/jingle-ways-megaways | No individual poster |
| Hansel & Gretel Candyhouse | 2021 | https://redtiger.com/games/hansel-and-gretel-candyhouse | No individual poster |
| Big Cat Rescue MegaWays | 2021 | https://redtiger.com/games/big-cat-rescue-megaways | No individual poster |
| Roman Emperors | 2021 | https://redtiger.com/games/roman-emperors | No individual poster |
| The Good The Bad and The Rich | 2021 | https://redtiger.com/games/the-good-the-bad-and-the-rich | No individual poster |
| Alexander the Great | 2021 | https://redtiger.com/games/alexander-the-great-world-conqueror | No individual poster |
| ShahMat | 2021 | https://redtiger.com/games/shah-mat | No individual poster |

## Skills, languages and education

- **Animation & VFX:** After Effects; Spine 2D; Adobe Animate; Adobe Character Animator; UI, character, symbol, and FX animation
- **Production & Optimization:** ActionScript procedural animation (After Effects / Animate); Animation structures optimized for JavaScript runtimes; UI and FX animation systems; Asset compression and optimization for browser and mobile
- **Tools & Workflow:** Git and repository-based workflows; Jira for production tracking; Notion for documentation and production coordination
- **Additional Software:** Premiere; Photoshop; Unreal Engine; Postshot (Jawset); DragonBones; Cascadeur (exploratory); JangaFX (exploratory)
- **AI & Emerging Tools:** Stable Diffusion; krea.ai; CodexGPT; Replit; VisualStudioCode; RAG; LLMs; GeminiCodeAssist; ComfyUI; Lovable; Claude Code; LoRAs; Antigravity; Ollama; ControlNet; agent2agent
- **Personal:** Strong communication and teamwork; Ability to manage multiple tasks and deadlines; High attention to detail; Adaptability to different art and animation styles
- **Bulgarian:** Native; visual level 5/5.
- **English:** C1 — Advanced; visual level 4/5.
- **French:** B2 — Upper Intermediate; visual level 3/5.
- **Spanish:** A1 — Beginner; visual level 1/5.
- **"Drugs and the Brain" Course:** California Institute of Technology; Remote; Sep 2012 — Jan 2013; Completed an online course exploring the neuroscience of drugs and their effects on the brain.
- **First Academic Year:** American University in Bulgaria; Blagoevgrad, Bulgaria; Sep 2008 — May 2009.

## Dynamic public-data behavior

- CVDataProvider starts from bundled data or localStorage cv-data-v2 when cv-data-version equals 4. Default changes invalidate that cache. Updates normally persist locally; replaceData(next, { persist: false }) changes the displayed CV without storing it.
- usePublishedCv loads cv_published fields data,name,slug anonymously via Supabase. The root route requests is_live=true; /cv/:slug requests that slug. Successful results replace the entire displayed CV, including custom content. Errors or missing records keep bundled/local data; the hook state is not displayed. Public reads here could not be verified because the environment network proxy rejects the Supabase host (403 tunnel).
- ?edit=true or VITE_ENABLE_EDITOR=true enables lazy ContentEditor. /admin provides authenticated version editing/publishing. Preserve context-based data access and existing content schemas; avoid hardcoded portfolio identities for layout.
- Hero portrait resolver maps legacy local photo paths to the imported bundled image; custom data, absolute HTTP URLs and root paths are supported. Registered trademark rendering normalizes both ® and literal \u00AE without breaking marked words.

## Existing interaction and presentation findings

- The hero ignores the existing senior title and hardcodes the generic discipline line; its leadership summary is hidden behind ABOUT. This is the strongest explanation for the current junior/generalist impression.
- Public order is hero → portfolio → skills → experience → education → contact. Six smaller portfolio cards precede the current lead collection; the 2024 Showreel is fourth among them. Leadership responsibility is buried after all skills.
- Navigation supports six section fragments, programmatic-scroll coordination, active highlighting, responsive touch targets and portrait Home state after leaving the hero. Keep these affordances accessible.
- ABOUT is a max-height disclosure of both paragraphs and extends hero layout; portfolio project cards and game destinations open new tabs. Collection sorts games newest first, filters by year, resets expansion on filter change, displays the first eight, and exposes all on request.
- Poster rail currently traps vertical wheel input across the entire collection shell and translates it to horizontal scrolling. Poster cards crop 2560×820 banners into 3:4 portrait frames, obscuring artwork; use their native cinematic ratio for clearer attribution. Hover tilt/glow, motes and timeline decoration convey less professional value than clear work and responsibility.
- Motion wrappers use viewport reveals, hover/press transforms and reduced-motion handling; retain visible content when reduced motion is requested. AnimatedSection currently ignores its delay prop by forcing delay: 0. HeroParticles exists but is unused by the current hero.

## Link and asset audit

- All referenced local thumbnail/portrait/fallback files are present. Nine distinct external poster URLs (ten entries) returned HTTP 200 with image content types on HEAD checks. No broken assets were found from repository/HTTP checks.
- Red Tiger collection and all distinct game URLs returned HTTP 200 on HEAD checks; Vimeo Brain Freeze returned HTTP 200. This confirms delivery, not that every page represents the intended game. YouTube/youtu.be destinations are blocked by the environment network proxy (403 tunnel), so availability cannot be concluded.
- Existing anomaly: Bass Boss 2 has the same /games/bass-boss destination and identical poster as Bass Boss. Preserve this data under the user constraint; do not silently rename, deduplicate or invent a correction.

## Content-backed seniority signals and hierarchy

1. Render the exact existing senior title prominently beside Ivan’s identity. Keep portrait and original subtitle. Give the existing Showreel an immediate CTA using its stored URL/year.
2. Surface the existing first About paragraph and current Dopamine lead role. Its documented progression, ownership of full-team animation quality, cross-discipline coordination, hands-on execution and workflow improvement establish seniority without extra claims.
3. Lead the work narrative with the Red Tiger collection and its exact lead descriptor, while retaining every released game, year, link and poster. Pair with the existing current-role date span rather than invented commercial metrics.
4. Present all six other projects with their original role descriptors, dates, categories and destinations; National Geographic and Rescue Heroes (14 episodes) demonstrate international production breadth. Retain the explicit limited/uncredited qualifier for John Vardar in Experience.
5. Place complete Experience before skill detail or make current lead Experience immediately adjacent to work. Give all nine entries readable dates and responsibility text.
6. Preserve all skills and proficiency qualifiers, personal skills/languages, education and contact at readable scale. Professional restraint, coherent typography, generous composition and disciplined motion should support the evidence.
