
// ============================================================
// CV DATA MODEL — Edit this file to update all CV content.
// No code changes needed in components.
// ============================================================

import portfolioThumbnails from "@/data/portfolioThumbnails";

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights?: string[];
  tags?: string[];
  links?: { label: string; url: string }[];
}

export interface SkillCategory {
  category: string;
  skills: string[];
  note?: string;
}

export interface SkillSection {
  title: string;
  groups: SkillCategory[];
}

export interface LanguageItem {
  language: string;
  proficiency: string;
  level: number; // 1-5
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface PortfolioItem {
  id: string;
  order: number;
  title: string;
  descriptor: string;
  year?: string;
  category?: string;
  url: string;
  ctaLabel?: string;
  thumbnail: string;
  type?: "project" | "collection";
  games?: { name: string; url?: string; year?: string }[];
}

export interface CVData {
  hero: {
    name: string;
    title: string;
    subtitle: string;
    photoUrl?: string;
    resumeUrl?: string;
  };
  about: {
    paragraphs: string[];
  };
  experience: ExperienceItem[];
  portfolio: PortfolioItem[];
  skills: {
    sections: SkillSection[];
    personal: string[];
  };
  languages: LanguageItem[];
  education: EducationItem[];
  contact: {
    email: string;
    phone?: string;
    location: string;
    website?: string;
    linkedin?: string;
    vimeo?: string;
    imdb?: string;
    links: { label: string; url: string; icon?: string }[];
  };
}

const cvData: CVData = {
  hero: {
    name: "Ivan Gegov",
    title: "Senior Animator / Animation Lead · Compositing · VFX",
    subtitle:
      "Where imagination meets the timeline — crafting worlds, one frame at a time.",
    photoUrl:
      "/assets/slackPic.png",
  },
  about: {
    paragraphs: [
      "Animation Lead and VFX professional with a track record spanning animated series, casino game development, commercials, and music videos. Experienced in leading animation teams, defining quality standards, and delivering visually polished content under tight deadlines.",
      "Comfortable working in fast-paced studio environments as well as independently on freelance projects. Experienced in multicultural teams and international productions. Always looking for the next compelling visual challenge.",
    ],
  },
  experience: [
    {
      id: "exp-dopamine",
      role: "Senior Animator / Animation Lead",
      company: "Dopamine (Red Tiger)",
      location: "Sofia, Bulgaria",
      startDate: "Mar 2021",
      endDate: "Present",
      description:
        "Joined as Senior Animator producing 2D animation, VFX, and in-engine implementation for slot games published under the Red Tiger brand. Progressed into Animation Lead, taking ownership of animation execution and quality across a full game development team while continuing hands-on production.",
      highlights: [
        "Leading and coordinating animation work within a multidisciplinary game team",
        "Defining and maintaining animation quality standards and visual consistency",
        "Hands-on production of animations and VFX for slot games",
        "Close collaboration with game designers, developers, and artists",
        "Supporting and improving animation pipelines and workflows",
      ],
      tags: ["Animation Lead", "2D Animation", "VFX", "Slot Games", "Red Tiger"],
    },
    {
      id: "exp-freelance",
      role: "Animation, Compositing & VFX Artist",
      company: "Freelance",
      location: "Sofia, Bulgaria",
      startDate: "Mar 2013",
      endDate: "Present",
      description:
        "Animation, compositing, and visual effects across a variety of freelance projects for studios, agencies, and independent productions.",
      tags: ["After Effects", "Compositing", "VFX", "Animation"],
      links: [
        { label: "Showreel", url: "https://youtu.be/ogwVYZrWI6s" },
      ],
    },
    {
      id: "exp-semperia",
      role: "Compositing & VFX Artist",
      company: "Semperia Films",
      location: "Sofia, Bulgaria",
      startDate: "Jul 2020",
      endDate: "Aug 2020",
      description:
        'Compositing and visual effects for the short film "In Author\'s Hands".',
      tags: ["Compositing", "VFX"],
      links: [
        {
          label: "In Author's Hands",
          url: "https://youtu.be/pInnrhghaxY",
        },
      ],
    },
    {
      id: "exp-chase-a-cloud",
      role: "Animation, Compositing & VFX Artist",
      company: "Chase a Cloud",
      location: "Sofia, Bulgaria",
      startDate: "Aug 2018",
      endDate: "Jun 2020",
      description:
        "Part of the compositing and VFX team working on animated series and promotional content for international clients.",
      highlights: [
        // Trademark notation applied on first occurrence only per page.
        "National Geographic's Explorers Academy \u2014 \"Brain Freeze\"",
        "\"Rescue Heroes\" \u2014 contributed to production by TONGAL for Fisher-Price\u00AE (14 episodes)",
        '"Arcana Magica" — Kickstarter promotional video',
        "John Vardar vs the Galaxy — animated feature film (limited compositing work, uncredited)",
      ],
      tags: ["After Effects", "Compositing", "VFX", "Animation"],
      links: [
        {
          label: "Brain Freeze",
          url: "https://vimeo.com/283914588",
        },
        {
          label: "Rescue Heroes",
          url: "https://www.youtube.com/watch?v=SOjHSKbRVCQ",
        },
        {
          label: "Arcana Magica",
          url: "https://www.youtube.com/watch?v=qeevdrluvnA",
        },
      ],
    },
    {
      id: "exp-dve-coord",
      role: "Coordinator",
      company: "DVE Events",
      location: "Zaragoza, Spain",
      startDate: "Sep 2015",
      endDate: "Nov 2015",
      description:
        'Construction and maintenance of a temporary base for the German army during NATO\'s "Trident Juncture" 2015 exercise at the Academia General Militar.',
      tags: ["Logistics", "Coordination"],
    },
    {
      id: "exp-youchip",
      role: "Chief Assistant for Network Specialist",
      company: "YouChip Cashless Systems",
      location: "Germany, England, Sweden",
      startDate: "May 2015",
      endDate: "Aug 2015",
      description:
        "LAN and WAN network cabling and setup, OS installation, configuration of work software and peripheral devices for RFID payment systems at music festivals.",
      tags: ["LAN/WAN", "Hardware", "RFID"],
    },
    {
      id: "exp-dve-translator",
      role: "Translator & Coordinator",
      company: "DVE Events",
      location: "Normandy, France",
      startDate: "May 2014",
      endDate: "Jun 2014",
      description:
        "Translator and coordinator at the 70th anniversary of D-Day in Normandy.",
      tags: ["Translation", "Coordination"],
    },
    {
      id: "exp-miro",
      role: "Screenwriter, Second Director & VFX",
      company: "Miroslav Kostadinov — Miro",
      location: "Sofia, Bulgaria",
      startDate: "Jan 2013",
      endDate: "May 2013",
      description:
        'Screenwriting, second directing, and visual effects for the music video "Souvenir".',
      tags: ["VFX", "Screenwriting", "Directing"],
      links: [
        { label: "Souvenir", url: "https://youtu.be/C8Mwkhu3iq4" },
      ],
    },
    {
      id: "exp-bigsky",
      role: "Warehouse & Communications Manager",
      company: '"Big Sky" Tent & Party Rentals',
      location: "Oak Bluffs, USA",
      startDate: "Jun 2009",
      endDate: "Oct 2009",
      description:
        "Coordinating teams, controlling inventory, and managing communications for a tent and event rental company.",
      tags: ["Logistics", "Inventory", "Team Coordination"],
    },
  ],
  portfolio: [
    {
      id: "pf-brainfreeze",
      order: 1,
      title: "National Geographic\u00AE \u2014 Brain Freeze",
      descriptor: "Animation · Compositing",
      year: "2018",
      category: "Series",
      url: "https://vimeo.com/283914588",
      ctaLabel: "Watch",
      type: "project",
      thumbnail: portfolioThumbnails.natgeo,
    },
    {
      id: "pf-rescue",
      order: 2,
      title: "Rescue Heroes",
      descriptor: "Animation · Series (14 episodes)",
      year: "2020",
      category: "Series",
      url: "https://www.youtube.com/watch?v=SOjHSKbRVCQ",
      ctaLabel: "Watch",
      type: "project",
      thumbnail: portfolioThumbnails.rescue,
    },
    {
      id: "pf-souvenir",
      order: 3,
      title: "Miro \u2014 Souvenir",
      descriptor: "Music Video · VFX",
      year: "2013",
      category: "Music Video",
      url: "https://youtu.be/C8Mwkhu3iq4",
      ctaLabel: "Watch",
      type: "project",
      thumbnail: portfolioThumbnails.souvenir,
    },
    {
      id: "pf-showreel",
      order: 4,
      title: "Showreel",
      descriptor: "Animation · Compositing · VFX",
      year: "2024",
      category: "Showreel",
      url: "https://youtu.be/ogwVYZrWI6s",
      ctaLabel: "Watch",
      type: "project",
      thumbnail: portfolioThumbnails.showreel,
    },
    {
      id: "pf-arcana",
      order: 5,
      title: "Arcana Magica",
      descriptor: "Animation · Promotional",
      year: "2019",
      category: "Promo",
      url: "https://www.youtube.com/watch?v=qeevdrluvnA",
      ctaLabel: "Watch",
      type: "project",
      thumbnail: portfolioThumbnails.arcana,
    },
    {
      id: "pf-authors",
      order: 6,
      title: "In Author\u2019s Hands",
      descriptor: "Short Film · VFX",
      year: "2020",
      category: "Short Film",
      url: "https://youtu.be/pInnrhghaxY",
      ctaLabel: "Watch",
      type: "project",
      thumbnail: portfolioThumbnails.authors,
    },
    {
      id: "pf-redtiger",
      order: 7,
      title: "Red Tiger collection",
      descriptor:
        "Selection of slot games animated and developed while working at Dopamine (published under the Red Tiger brand).",
      year: "2021-2025",
      category: "Game Collection",
      url: "https://redtiger.com/games",
      ctaLabel: "Visit Red Tiger",
      type: "collection",
      thumbnail: portfolioThumbnails.redtiger,
      games: [
        { name: "DragonBoyz", url: "https://redtiger.com/games/dragon-boyz", year: "2025" },
        { name: "Big Rich Turkeys", url: "https://redtiger.com/games/big-rich-turkeys", year: "2025" },
        { name: "Cash Lamps", url: "https://redtiger.com/games/cash-lamps", year: "2025" },
        { name: "Monopoly\u00AE Rent Rush", url: "https://redtiger.com/games/monopoly-rent-rush", year: "2025" },
        { name: "Piggy Riches 2 Megaways", url: "https://redtiger.com/games/piggy-riches-2-megaways", year: "2025" },
        { name: "Piggy Riches Begins", url: "https://redtiger.com/games/piggy-riches-begins", year: "2025" },
        { name: "Bass Boss", url: "https://redtiger.com/games/bass-boss", year: "2025" },
        { name: "Bass Boss 2", url: "https://redtiger.com/games/bass-boss", year: "2025" },
        { name: "Judgment Day MegaWays", url: "https://redtiger.com/games/judgement-day-megaways", year: "2024" },
        { name: "Monsters Unchained", url: "https://redtiger.com/games/monsters-unchained", year: "2024" },
        { name: "Cake and Ice Cream", url: "https://redtiger.com/games/cake-and-ice-cream", year: "2024" },
        { name: "Cai Shen 168", url: "https://redtiger.com/games/cai-shen-168", year: "2024" },
        { name: "Piñatas & Ponies", url: "https://redtiger.com/games/pinatas-and-ponies", year: "2024" },
        { name: "Happy Apples", url: "https://redtiger.com/games/happy-apples", year: "2024" },
        { name: "Trophy Fish", url: "https://redtiger.com/games/trophy-fish", year: "2024" },
        { name: "Fishtastic", url: "https://redtiger.com/games/fishtastic", year: "2024" },
        { name: "Rise of Cleopatra", url: "https://redtiger.com/games/rise-of-cleopatra", year: "2023" },
        { name: "7's Luck", url: "https://redtiger.com/games/7s-luck", year: "2023" },
        { name: "Dear Santa", url: "https://redtiger.com/games/dear-santa", year: "2023" },
        { name: "The Wild Kiss", url: "https://redtiger.com/games/the-wild-kiss", year: "2023" },
        { name: "Beriched", url: "https://redtiger.com/games/beriched", year: "2023" },
        { name: "Athens MegaWays", url: "https://redtiger.com/games/athens-megaways", year: "2023" },
        { name: "Astros", url: "https://redtiger.com/games/astros", year: "2023" },
        { name: "Gonzita's Quest", url: "https://redtiger.com/games/gonzitas-quest", year: "2023" },
        { name: "Dragon's Mirror", url: "https://redtiger.com/games/dragons-mirror", year: "2022" },
        { name: "Dracula Awakening", url: "https://redtiger.com/games/dracula-awakening", year: "2022" },
        { name: "Gold Mine Mistress", url: "https://redtiger.com/games/gold-mine-mistress", year: "2022" },
        { name: "Fa Fa Babies 2", url: "https://redtiger.com/games/fa-fa-babies-2", year: "2022" },
        { name: "Bounty Raid 2", url: "https://redtiger.com/games/bounty-raid-2", year: "2022" },
        { name: "Wolfkin", url: "https://redtiger.com/games/wolfkin", year: "2022" },
        { name: "Reel Keeper Power Reels", url: "https://redtiger.com/games/reel-keeper-power-reels", year: "2022" },
        { name: "Majestic Mysteries Power Reels", url: "https://redtiger.com/games/majestic-mysteries-power-reels", year: "2022" },
        { name: "Jingle Ways MegaWays", url: "https://redtiger.com/games/jingle-ways-megaways", year: "2021" },
        { name: "Hansel & Gretel Candyhouse", url: "https://redtiger.com/games/hansel-and-gretel-candyhouse", year: "2021" },
        { name: "Big Cat Rescue MegaWays", url: "https://redtiger.com/games/big-cat-rescue-megaways", year: "2021" },
        { name: "Roman Emperors", url: "https://redtiger.com/games/roman-emperors", year: "2021" },
        { name: "The Good The Bad and The Rich", url: "https://redtiger.com/games/the-good-the-bad-and-the-rich", year: "2021" },
        { name: "Alexander the Great", url: "https://redtiger.com/games/alexander-the-great-world-conqueror", year: "2021" },
        { name: "ShahMat", url: "https://redtiger.com/games/shah-mat", year: "2021" },
      ],
    },
  ],
  skills: {
    sections: [
      {
        title: "Technical & Production",
        groups: [
          {
            category: "Adobe",
            skills: ["After Effects", "Animate", "Photoshop", "Character Animator", "Premiere"],
          },
          {
            category: "Animation",
            skills: ["Spine 2D (2.5D animation software)"],
          },
          {
            category: "Production & Optimization",
            skills: [
              "Scripting (ActionScript) for procedural animation and optimization",
              "Animation structures and logic optimized for JavaScript / runtime implementation",
              "UI, symbol, character, and FX animation",
              "Asset optimization for browser and mobile performance",
              "Asset compression and optimizing export workflows",
            ],
          },
        ],
      },
      {
        title: "Tools & Pipelines",
        groups: [
          {
            category: "Production Tools",
            skills: [
              "Git and repository-based workflows",
              "Jira and Notion for production tracking and documentation",
            ],
          },
          {
            category: "Exploratory",
            skills: ["Postshot Jawset", "Cascadeur", "JangaFX", "Unreal Engine", "Dragon Bones"],
            note: "Amateur / exploratory experience",
          },
        ],
      },
      {
        title: "AI & Emerging Tools",
        groups: [
          {
            category: "Practical Familiarity",
            skills: ["Stable Diffusion", "ControlNet", "LoRAs", "ComfyUI"],
            note: "Basic hands-on familiarity",
          },
          {
            category: "",
            skills: [
              "Interest in open-source AI models for workflow optimization and pipeline automation",
            ],
          },
        ],
      },
    ],
    personal: [
      "Strong communication and teamwork",
      "Ability to manage multiple tasks and deadlines",
      "High attention to detail",
      "Adaptability to different art and animation styles",
    ],
  },
  languages: [
    { language: "Bulgarian", proficiency: "Native", level: 5 },
    { language: "English", proficiency: "C1 — Advanced", level: 4 },
    { language: "French", proficiency: "B2 — Upper Intermediate", level: 3 },
    { language: "Spanish", proficiency: "A1 — Beginner", level: 1 },
  ],
  education: [
    {
      id: "edu-caltech",
      degree: '"Drugs and the Brain" Course',
      institution: "California Institute of Technology",
      location: "Remote",
      startDate: "Sep 2012",
      endDate: "Jan 2013",
      description:
        "Completed an online course exploring the neuroscience of drugs and their effects on the brain.",
    },
    {
      id: "edu-aubg",
      degree: "First Academic Year",
      institution: "American University in Bulgaria",
      location: "Blagoevgrad, Bulgaria",
      startDate: "Sep 2008",
      endDate: "May 2009",
    },
  ],
  contact: {
    email: "ivangegov.dve@gmail.com",
    location: "Sofia, Bulgaria",
    links: [
      { label: "Email", url: "mailto:ivangegov.dve@gmail.com" },
      { label: "YouTube", url: "https://youtu.be/ogwVYZrWI6s" },
      { label: "Vimeo", url: "https://vimeo.com/283914588" },
    ],
  },
};

export default cvData;








