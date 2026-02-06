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
  skills: {
    technical: SkillCategory[];
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
    title: "Animation · Compositing · VFX",
    subtitle:
      "Bringing stories to life through visual effects, compositing, and motion",
  },
  about: {
    paragraphs: [
      "VFX compositor and animator with experience across animated series, feature projects, commercials, and music videos. Skilled in Adobe After Effects, Character Animator, Boris FX Mocha, 3ds Max, and a broad range of compositing and animation tools.",
      "Comfortable working in fast-paced studio environments as well as independently on freelance projects. Experienced in multicultural teams and international productions. Always looking for the next compelling visual challenge.",
    ],
  },
  experience: [
    {
      id: "exp-dopamine",
      role: "Senior Animator → Animation Lead",
      company: "Dopamine (Red Tiger)",
      location: "Sofia, Bulgaria",
      startDate: "Mar 2021",
      endDate: "Present",
      description:
        "Joined as Senior Animator producing high-quality 2D animation, VFX, and in-engine implementation for premium slot games published under the Red Tiger brand. Progressed into Animation Lead, taking ownership of animation execution and quality across a full game development team — balancing hands-on production with leadership.",
      highlights: [
        "Leading and coordinating animation work within a multidisciplinary game team",
        "Defining and maintaining animation quality standards and visual consistency",
        "Hands-on production of animations and VFX for slot games",
        "Close collaboration with game designers, developers, and artists",
        "Supporting and improving animation pipelines and workflows",
        "Additional titles: Beriched, Athens MegaWays, Astros, Gonzita's Quest, Dragon's Mirror, Dracula Awakening, Gold Mine Mistress, Piggy Riches MegaWays, Fa Fa Babies 2, Bounty Raid 2, Wolfkin, Reel Keeper Power Reels, Majestic Mysteries Power Reels, Jingle Ways MegaWays, Hansel & Gretel Candy House, Big Cat Rescue MegaWays, Roman Emperors, The Good The Bad and The Rich, Alexander the Great, ShahMat",
      ],
      tags: ["Animation Lead", "2D Animation", "VFX", "Slot Games", "Red Tiger"],
      links: [
        { label: "Monsters Unchained", url: "https://www.redtiger.com/games/monsters-unchained" },
        { label: "Cake and Ice Cream", url: "https://www.redtiger.com/games/cake-and-ice-cream" },
        { label: "Bass Boss", url: "https://www.redtiger.com/games/bass-boss" },
        { label: "Cai Shen 168", url: "https://www.redtiger.com/games/cai-shen-168" },
        { label: "Piñatas & Ponies", url: "https://www.redtiger.com/games/pinatas-and-ponies" },
        { label: "Dear Santa", url: "https://www.redtiger.com/games/dear-santa" },
        { label: "Happy Apples", url: "https://www.redtiger.com/games/happy-apples" },
        { label: "Judgment Day MegaWays", url: "https://www.redtiger.com/games/judgment-day-megaways" },
      ],
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
      role: "Compositor & VFX Artist",
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
        'National Geographic\'s Explorers Academy — "Brain Freeze"',
        '"Rescue Heroes" — production by TONGAL for Fisher-Price (14 episodes)',
        '"Arcana Magica" — Kickstarter promotional video',
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
  skills: {
    technical: [
      {
        category: "Compositing & VFX",
        skills: [
          "Adobe After Effects",
          "Boris FX Mocha",
          "Particle Systems",
          "Adobe Character Animator",
        ],
      },
      {
        category: "3D & Animation",
        skills: ["3ds Max"],
      },
      {
        category: "Edit & Post",
        skills: ["Adobe Premiere", "Adobe Photoshop"],
      },
      {
        category: "IT & Infrastructure",
        skills: [
          "MS Office",
          "LAN / WAN",
          "Peripheral Device Installation",
        ],
      },
    ],
    personal: [
      "Effective communicator",
      "Organized & team player",
      "Adaptive in multicultural environments",
      "Effective under pressure",
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
    email: "ivan.gegov@email.com",
    location: "Sofia, Bulgaria",
    links: [
      { label: "Email", url: "mailto:ivan.gegov@email.com" },
      { label: "YouTube", url: "https://youtu.be/ogwVYZrWI6s" },
      { label: "Vimeo", url: "https://vimeo.com/283914588" },
    ],
  },
};

export default cvData;
