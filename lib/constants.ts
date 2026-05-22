export interface Event {
  id: string;
  title: string;
  slug: string;
  location: string;
  date: string; // ISO date or human readable
  time?: string;
  image: string;
  url?: string;
  tags?: string[];
  description?: string;
}

export const events: Event[] = [
  {
    id: "react-conf-2026",
    title: "React Conf 2026",
    slug: "react-conf-2026",
    location: "Mumabi, MH, INDIA",
    date: "2026-10-14",
    time: "09:00",
    image: "/images/event1.png",
    url: "https://reactjs.org/conf/",
    tags: ["react", "frontend", "javascript"],
    description:
      "Official React conference featuring core team talks, ecosystem workshops, and community meetups.",
  },
  {
    id: "nextjs-conf-2026",
    title: "Next.js Conf 2026",
    slug: "nextjs-conf-2026",
    location: "Bengaluru,KA, INDIA",
    date: "2026-06-02",
    time: "10:00",
    image: "/images/event2.png",
    url: "https://nextjs.org/conf",
    tags: ["nextjs", "react", "web"],
    description:
      "Workshops and talks on the latest in Next.js, server components, and edge runtimes.",
  },
  {
    id: "jsconf-eu-2026",
    title: "JSConf EU 2026",
    slug: "jsconf-eu-2026",
    location: "Berlin, Germany",
    date: "2026-07-10",
    time: "09:30",
    image: "/images/event3.png",
    url: "https://jsconf.eu/",
    tags: ["javascript", "community"],
    description:
      "A community-run JavaScript conference with a broad program across frontend and backend topics.",
  },
  {
    id: "google-io-2026",
    title: "Google I/O 2026",
    slug: "google-io-2026",
    location: "Mountain View, CA, USA",
    date: "2026-05-19",
    time: "11:00",
    image: "/images/event4.png",
    url: "https://events.google.com/io/",
    tags: ["mobile", "cloud", "ai"],
    description:
      "Google's annual developer conference covering Android, Web, Cloud, and AI announcements.",
  },
  {
    id: "hackmit-2026",
    title: "HackMIT 2026",
    slug: "hackmit-2026",
    location: "Cambridge, MA, USA",
    date: "2026-09-18",
    time: "18:00",
    image: "/images/event5.png",
    url: "https://hackmit.org/",
    tags: ["hackathon", "students", "projects"],
    description:
      "One of the largest student-run hackathons in the US — 24+ hours of building and mentorship.",
  },
  {
    id: "devopsdays-2026",
    title: "DevOpsDays 2026",
    slug: "devopsdays-2026",
    location: "London, UK",
    date: "2026-11-04",
    time: "09:00",
    image: "/images/event6.png",
    url: "https://devopsdays.org/",
    tags: ["devops", "infrastructure", "ci/cd"],
    description:
      "Regional DevOpsDays with talks, open spaces and practitioner-led sessions.",
  },
  {
    id: "global-tech-summit-2026",
    title: "Global Tech Summit 2026",
    slug: "global-tech-summit-2026",
    location: "Singapore",
    date: "2026-08-22",
    time: "09:00",
    image: "/images/event-full.png",
    url: "https://example.com/global-tech-summit",
    tags: ["conference", "tech", "summit"],
    description:
      "Multi-track summit for engineering leaders, product teams, and builders across industries.",
  },
];

export default events;
