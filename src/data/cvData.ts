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
    name: "Your Name",
    title: "Compositor · VFX Artist · Animator",
    subtitle: "Bringing stories to life through visual effects and motion",
  },
  about: {
    paragraphs: [
      "Experienced VFX compositor and animator with over a decade of work across feature films, commercials, and broadcast. Skilled in Nuke, After Effects, Flame, and a broad range of compositing and animation tools.",
      "Passionate about blending technical precision with creative storytelling. Comfortable working in fast-paced studio environments as well as independently on freelance projects. Always looking for the next compelling visual challenge.",
    ],
  },
  experience: [
    // ——— Add your latest roles here ———
    {
      id: "placeholder-new",
      role: "Add Your Latest Role Here",
      company: "Company Name",
      location: "City",
      startDate: "2020",
      endDate: "Present",
      description:
        "Describe your recent work — projects, responsibilities, and key achievements. This placeholder is here to remind you to fill in the last 5 years.",
      highlights: ["Key achievement or project"],
      tags: ["Nuke", "After Effects"],
      links: [],
    },
    {
      id: "exp-1",
      role: "Senior Compositor",
      company: "VFX Studio",
      location: "London, UK",
      startDate: "2017",
      endDate: "2019",
      description:
        "Led compositing on feature film and high-end TV projects. Responsible for CG integration, clean-up, colour matching, and final delivery of complex shots.",
      highlights: [
        "Composited 120+ shots for a major feature film release",
        "Mentored junior artists and reviewed dailies",
      ],
      tags: ["Nuke", "Flame", "CG Integration"],
      links: [
        { label: "Showreel", url: "#" },
      ],
    },
    {
      id: "exp-2",
      role: "Compositor / Animator",
      company: "Freelance",
      location: "Remote / Various",
      startDate: "2014",
      endDate: "2017",
      description:
        "Freelance compositing and motion graphics for commercials, music videos, and broadcast. Clients included agencies and production houses across Europe.",
      highlights: [
        "Delivered 30+ commercial projects on tight deadlines",
        "Developed custom expressions and scripts for After Effects pipelines",
      ],
      tags: ["After Effects", "Cinema 4D", "Motion Graphics"],
      links: [],
    },
    {
      id: "exp-3",
      role: "Junior Compositor",
      company: "Post-Production House",
      location: "Paris, France",
      startDate: "2011",
      endDate: "2014",
      description:
        "Assisted senior compositors on feature and commercial projects. Gained experience in rotoscoping, keying, tracking, and plate preparation.",
      highlights: [
        "Worked on 3 feature films and multiple commercial campaigns",
        "Built internal asset library used across the department",
      ],
      tags: ["Nuke", "Rotoscoping", "Tracking"],
      links: [],
    },
    {
      id: "exp-4",
      role: "Compositing Intern",
      company: "Animation Studio",
      location: "Paris, France",
      startDate: "2010",
      endDate: "2011",
      description:
        "Interned on animated short films and commercial projects. Assisted with compositing, rendering, and colour grading.",
      tags: ["Nuke", "After Effects", "Colour Grading"],
      links: [],
    },
  ],
  skills: {
    technical: [
      {
        category: "Compositing",
        skills: ["Nuke", "Flame", "After Effects", "Fusion"],
      },
      {
        category: "3D & Animation",
        skills: ["Cinema 4D", "Maya", "Blender", "Houdini"],
      },
      {
        category: "Motion & Edit",
        skills: ["Premiere Pro", "DaVinci Resolve", "Final Cut Pro"],
      },
      {
        category: "Pipeline & Tools",
        skills: ["Python", "Expressions", "Shotgrid", "Git"],
      },
    ],
    personal: [
      "Creative problem-solving",
      "Team leadership & mentoring",
      "Client communication",
      "Deadline management",
      "Adaptability",
    ],
  },
  languages: [
    { language: "French", proficiency: "Native", level: 5 },
    { language: "English", proficiency: "Fluent", level: 5 },
    { language: "Spanish", proficiency: "Intermediate", level: 3 },
    { language: "German", proficiency: "Basic", level: 1 },
  ],
  education: [
    {
      id: "edu-1",
      degree: "Master's in Digital Animation & VFX",
      institution: "Supinfocom / Rubika",
      location: "Valenciennes, France",
      startDate: "2008",
      endDate: "2010",
      description:
        "Specialised in 3D animation, compositing, and post-production workflows. Directed a graduation short film screened at international festivals.",
    },
    {
      id: "edu-2",
      degree: "Bachelor's in Graphic Design & Multimedia",
      institution: "University of Arts",
      location: "France",
      startDate: "2005",
      endDate: "2008",
      description:
        "Foundation in graphic design, typography, photography, and video editing.",
    },
  ],
  contact: {
    email: "hello@yourname.com",
    location: "London, UK",
    website: "https://yourname.com",
    linkedin: "https://linkedin.com/in/yourname",
    vimeo: "https://vimeo.com/yourname",
    imdb: "https://imdb.com/name/yourname",
    links: [
      { label: "Email", url: "mailto:hello@yourname.com" },
      { label: "LinkedIn", url: "https://linkedin.com/in/yourname" },
      { label: "Vimeo", url: "https://vimeo.com/yourname" },
      { label: "IMDb", url: "https://imdb.com/name/yourname" },
    ],
  },
};

export default cvData;
