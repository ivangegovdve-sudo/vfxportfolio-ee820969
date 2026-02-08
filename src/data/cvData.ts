// ============================================================
// CV DATA MODEL — Edit this file to update all CV content.
// No code changes needed in components.
// ============================================================

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
  title: string;
  descriptor: string;
  url: string;
  ctaLabel?: string;
  thumbnail?: string;
  type?: "project" | "collection";
  games?: { name: string; url?: string }[];
}

export interface CVData {
  hero: {
    name: string;
    title: string;
    subtitle: string;
    photoUrl?: https://github.com/ivangegovdve-sudo/python-learning-orchestrated/blob/main/src/assets/slackPic.png?raw=true;
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
      "Bringing stories to life through visual effects, compositing, and motion",
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
      links: [https://i.ytimg.com/vi/ogwVYZrWI6s/hqdefault.jpg?sqp=-oaymwEnCPYBEIoBSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLAxmzNzd3IE3qWB2AmwulQrcnKOng
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
      links: [https://github.com/ivangegovdve-sudo/python-learning-orchestrated/blob/main/src/assets/AuthRigts.png?raw=true
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
        'National Geographic\'s Explorers Academy — "Brain Freeze"',
        '"Rescue Heroes" — production by TONGAL for Fisher-Price (14 episodes)',
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
      links: [https://github.com/ivangegovdve-sudo/python-learning-orchestrated/blob/main/src/assets/miro.png?raw=true
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
      title: 'National Geographic – Explorers Academy "Brain Freeze"',
      descriptor: "Animation · Compositing",
      url: "https://vimeo.com/283914588",
      ctaLabel: "Watch",
      type: "project",
    },
    {
      id: "pf-rescue",
      title: "Fisher-Price / TONGAL – Rescue Heroes",
      descriptor: "Animation · Series (14 episodes)",
      url: "https://www.youtube.com/watch?v=SOjHSKbRVCQ",
      ctaLabel: "Watch",
      type: "project",
    },
    {
      id: "pf-arcana",
      title: "Arcana Magica – Kickstarter Promo",
      descriptor: "Animation · Promotional",
      url: "https://www.youtube.com/watch?v=qeevdrluvnA",
      ctaLabel: "Watch",
      type: "project",
    },
    {
      id: "pf-showreel",
      title: "Showreel",
      descriptor: "Animation & VFX Reel",
      url: "https://youtu.be/ogwVYZrWI6s",
      ctaLabel: "Watch",
      type: "project",
    },
    {
      id: "pf-souvenir",
      title: "Souvenir",
      descriptor: "Music Video · VFX",
      url: "https://youtu.be/C8Mwkhu3iq4",
      ctaLabel: "Watch",
      type: "project",
    },
    {
      id: "pf-authors",
      title: "In Author's Hands",
      descriptor: "Short Film · VFX",
      url: "https://youtu.be/pInnrhghaxY",
      ctaLabel: "Watch",
      type: "project",
    },
    {
      id: "pf-redtiger",
      title: "Red Tiger Slot Games",
      descriptor:
        "Selection of slot games animated and developed while working at Dopamine (published under the Red Tiger brand).",
      url: "https://redtiger.com/games",
      ctaLabel: "Visit Red Tiger",
      type: "collection",
      games: [
        { name: "DragonBoyz" },
        { name: "Big Rich Turkeys" },
        { name: "Cash Lamps" },
        { name: "Monopoly Rent Rush" },
        { name: "Piggy Riches 2 Megaways" },
        { name: "Piggy Riches Begins" },
        { name: "Bass Boss" },
        { name: "Bass Boss 2" },
        { name: "Judgment Day MegaWays" },
        { name: "Monsters Unchained" },
        { name: "Cake and Ice Cream" },
        { name: "Cai Shen 168" },
        { name: "Piñatas & Ponies" },
        { name: "Happy Apples" },
        { name: "Trophy Fish" },
        { name: "Fishtastic" },
        { name: "Rise of Cleopatra" },
        { name: "7's Luck" },
        { name: "Dear Santa" },
        { name: "The Wild Kiss" },
        { name: "Beriched" },
        { name: "Athens MegaWays" },
        { name: "Astros" },
        { name: "Gonzita's Quest" },
        { name: "Dragon's Mirror" },
        { name: "Dracula Awakening" },
        { name: "Gold Mine Mistress" },
        { name: "Fa Fa Babies 2" },
        { name: "Bounty Raid 2" },
        { name: "Wolfkin" },
        { name: "Reel Keeper Power Reels" },
        { name: "Majestic Mysteries Power Reels" },
        { name: "Jingle Ways MegaWays" },
        { name: "Hansel & Gretel Candyhouse" },
        { name: "Big Cat Rescue MegaWays" },
        { name: "Roman Emperors" },
        { name: "The Good The Bad and The Rich" },
        { name: "Alexander the Great" },
        { name: "ShahMat" },
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
            skills: ["After Effects", "Animate", "Photoshop", "Character Animator"],
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
