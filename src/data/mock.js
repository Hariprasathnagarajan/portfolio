// Mock data for portfolio - extracted from resume

export const personalInfo = {
  name: "Hariprasath N",
  title: "Full-Stack Developer",
  tagline: "Building scalable, production-grade web applications",
  email: "hariprasathnagarajan24@gmail.com",
  phone: "+91 9150835431",
  location: "Tiruchirappalli, Tamil Nadu, India",
  github: "https://github.com/hariprasathnagarajan",
  linkedin: "https://linkedin.com/in/hariprasath-nagarajan",
  summary: "Full-Stack Developer focused on building scalable, production-grade web applications with a strong emphasis on frontend engineering, performance optimization, and API-driven architectures. Hands-on experience with React, Next.js, Django, FastAPI, TypeScript, Tailwind CSS, SQL/NoSQL databases, WebSockets, and WebRTC for real-time features."
};

export const skills = [
  { name: "JavaScript", category: "Languages", level: 90 },
  { name: "TypeScript", category: "Languages", level: 85 },
  { name: "Python", category: "Languages", level: 88 },
  { name: "React.js", category: "Frontend", level: 92 },
  { name: "Next.js", category: "Frontend", level: 85 },
  { name: "Tailwind CSS", category: "Frontend", level: 90 },
  { name: "Node.js", category: "Backend", level: 80 },
  { name: "Django", category: "Backend", level: 85 },
  { name: "FastAPI", category: "Backend", level: 82 },
  { name: "MongoDB", category: "Database", level: 85 },
  { name: "MySQL", category: "Database", level: 80 },
  { name: "Docker", category: "DevOps", level: 75 },
  { name: "Git", category: "Tools", level: 90 },
  { name: "WebRTC", category: "Real-time", level: 78 },
  { name: "WebSockets", category: "Real-time", level: 80 }
];

export const projects = [
  {
    id: 1,
    title: "Real-Time Meeting Platform",
    description: "Built a real-time meeting application with video, audio, and chat using Next.js and TypeScript, focusing on low-latency communication and scalability.",
    tech: ["Next.js", "TypeScript", "WebRTC", "WebSockets"],
    image: null,
    github: "#",
    live: "#",
    featured: true
  },
  {
    id: 2,
    title: "EDU-Website",
    description: "Developed a FastAPI backend with JWT authentication, role-based routing, and WebSocket chat, along with a responsive React and Tailwind UI and MongoDB storage.",
    tech: ["React", "FastAPI", "MongoDB", "JWT", "WebSocket"],
    image: null,
    github: "#",
    live: "#",
    featured: true
  },
  {
    id: 3,
    title: "AI Coding Assistant",
    description: "Developed a LLaMA-powered coding assistant using LangChain and Streamlit for code generation, real-time responses, and contextual coding suggestions.",
    tech: ["Python", "LangChain", "Streamlit", "LLaMA"],
    image: null,
    github: "#",
    live: "#",
    featured: true
  },
  {
    id: 4,
    title: "Cafeteria Management System",
    description: "Created a full-stack application for order processing and menu management with an intuitive UI and reliable CRUD operations.",
    tech: ["React", "Node.js", "MongoDB", "Express"],
    image: null,
    github: "#",
    live: "#",
    featured: false
  },
  {
    id: 5,
    title: "Student Record Management",
    description: "Built a web-based student record management system using HTML, CSS, JavaScript, and MongoDB, including client-side validation and secure CRUD features.",
    tech: ["JavaScript", "MongoDB", "HTML", "CSS"],
    image: null,
    github: "#",
    live: "#",
    featured: false
  }
];

export const experience = [
  {
    company: "VDart",
    role: "Full-Stack Developer Intern",
    location: "Trichy",
    duration: "July 2025 - Present",
    responsibilities: [
      "Improved front-end performance by refactoring React components and optimizing state management",
      "Fixed UI and functional issues across VNavigate and VDart Academy platforms",
      "Built reusable React + Tailwind components for faster feature development",
      "Integrated REST APIs with secure authentication flows",
      "Collaborated in Agile sprints with code reviews and stand-ups"
    ]
  }
];

export const education = [
  {
    degree: "M.Sc. Computer Science",
    institution: "Bharathidasan University, Tiruchirappalli",
    duration: "2023 - 2025",
    grade: "CGPA: 8.0/10"
  },
  {
    degree: "B.Sc. Computer Science",
    institution: "National College, Tiruchirappalli",
    duration: "2020 - 2023",
    grade: "CGPA: 8.2/10"
  }
];

export const certifications = [
  "Application Developer — PMKVY",
  "Big Data Analytics — SWAYAM",
  "UI/UX Design — iLife Academy, Trichy"
];

export const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" }
];