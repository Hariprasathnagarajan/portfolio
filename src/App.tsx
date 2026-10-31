import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring, type Variants } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  Code2,
  Database,
  ExternalLink,
  Mail,
  MapPin,
  Menu,
  Terminal,
  X,
} from 'lucide-react'
import { Github, Linkedin } from './lib/icons'
import './App.css'

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Work', href: '#work' },
  { label: 'Skills', href: '#skills' },
]

const roles = ['Full-Stack Developer', 'Python Developer', 'AI Application Developer']

const liveSites = [
  {
    number: '01',
    name: 'VDart Academy',
    category: 'Education & Training',
    contribution: 'Complete website redesign',
    description: 'Redesigned the visual presentation, page structure, and content flow for an education and training website during my internship.',
    href: 'https://vdartacademy.com/',
    accent: 'amber',
  },
  {
    number: '02',
    name: 'VNavigate',
    category: 'Corporate · Compliance Services',
    contribution: 'Designed and developed from scratch',
    description: 'Created the website structure and interface around client requirements, then refined sections as the requirements changed.',
    href: 'https://vnavigate.com/',
    accent: 'blue',
  },
  {
    number: '03',
    name: 'VBooking',
    category: 'Booking platform',
    contribution: 'Developed from scratch',
    description: 'Contributed to the website structure and interface for a booking-focused digital product, with an emphasis on responsive usability.',
    href: 'https://vbooking.com/',
    accent: 'coral',
  },
]

const featuredProjects = [
  {
    number: '01',
    title: 'Research Paper Question Answering',
    category: 'AI application · Python',
    description: 'A RAG application for uploading research papers and asking questions against the document context instead of searching a long PDF manually.',
    features: ['Document upload and parsing', 'Semantic embeddings', 'FAISS vector search', 'Context-aware answers'],
    stack: ['Python', 'LangChain', 'Ollama', 'LLaMA 2', 'FAISS', 'Streamlit'],
    href: 'https://github.com/Hariprasathnagarajan',
    accent: 'amber',
  },
  {
    number: '02',
    title: 'Python AI Assistant',
    category: 'Python · AI application',
    description: 'A learning-focused assistant for Python explanations, code analysis, debugging help, and beginner-friendly responses.',
    features: ['Concept explanations', 'Code explanation', 'Debugging assistance', 'Interactive chat interface'],
    stack: ['Python', 'LangChain', 'Ollama', 'LLaMA 3', 'Streamlit'],
    href: 'https://github.com/Hariprasathnagarajan',
    accent: 'blue',
  },
  {
    number: '03',
    title: 'Learning Management System',
    category: 'Full-stack web application',
    description: 'A responsive learning platform with authentication, course management, REST API integration, and reusable interface components.',
    features: ['JWT authentication', 'Course management', 'Responsive interface', 'REST API architecture'],
    stack: ['React', 'Django REST Framework', 'PostgreSQL', 'Tailwind CSS'],
    href: 'https://github.com/Hariprasathnagarajan',
    accent: 'coral',
  },
  {
    number: '04',
    title: 'Real-Time Meeting Platform',
    category: 'Web application · realtime communication',
    description: 'A meeting platform built around browser-native communication, rooms, live messaging, and peer-to-peer media connections.',
    features: ['Room creation and joining', 'WebRTC media connections', 'Live messaging', 'Screen sharing'],
    stack: ['Next.js', 'TypeScript', 'WebRTC', 'WebSockets'],
    href: 'https://github.com/Hariprasathnagarajan',
    accent: 'violet',
  },
]

const skillGroups = [
  { label: 'Frontend', icon: Code2, tools: 'React · TypeScript · JavaScript · HTML · CSS · Tailwind CSS', detail: 'Responsive interfaces, reusable components, and clear page structure.' },
  { label: 'Backend', icon: Terminal, tools: 'Python · Django · Django REST Framework · FastAPI · REST APIs · JWT', detail: 'APIs and backend workflows that are easy to test, connect, and maintain.' },
  { label: 'AI applications', icon: BrainCircuit, tools: 'LLM applications · RAG · LangChain · Embeddings · Document search', detail: 'Practical AI features that connect models to useful application context.' },
  { label: 'Data & tools', icon: Database, tools: 'PostgreSQL · SQLite · FAISS · Git · GitHub · Postman', detail: 'The storage, search, and everyday tools behind the application.' },
]

const buildSteps = [
  ['01', 'Understand', 'Start with the user, the requirements, and what a successful result needs to do.'],
  ['02', 'Plan', 'Break the problem into smaller tasks and decide how the frontend, backend, and data connect.'],
  ['03', 'Build', 'Develop the interface, APIs, integrations, and the parts people interact with directly.'],
  ['04', 'Refine', 'Test the important flows, fix rough edges, improve usability, and document what changed.'],
]

const reveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
}

function SectionLabel({ number, children }: { number: string; children: string }) {
  return <div className="section-label"><span className="section-label__number">{number}</span><span className="section-label__line" /><span>{children}</span></div>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('about')
  const [roleIndex, setRoleIndex] = useState(0)
  const [skillIndex, setSkillIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const roleTimer = window.setInterval(() => setRoleIndex((index) => (index + 1) % roles.length), 2600)
    const sections = ['about', 'experience', 'live-work', 'work', 'skills', 'approach', 'contact']
    const onScroll = () => {
      const current = sections.reduce((found, id) => {
        const element = document.getElementById(id)
        if (element && window.scrollY + 180 >= element.offsetTop) return id
        return found
      }, 'about')
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.clearInterval(roleTimer); window.removeEventListener('scroll', onScroll) }
  }, [])

  const copyEmail = async () => {
    await navigator.clipboard?.writeText('hariprasathnagarajan24@gmail.com')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="site-shell" id="top">
      <motion.div className="scroll-progress" style={{ scaleX: progress }} />
      <aside className="side-rail" aria-label="Portfolio index">
        <a className="wordmark" href="#top" aria-label="Hariprasath Nagarajan home"><span>HN</span><i>/</i></a>
        <div className="side-rail__rule" />
        <span className="side-rail__vertical">FULL-STACK · PYTHON · AI</span>
        <span className="side-rail__index">{String(Math.max(navItems.findIndex((item) => item.href === `#${activeSection}`) + 1, 1)).padStart(2, '0')} / 05</span>
      </aside>

      <header className="topbar">
        <a className="wordmark wordmark--mobile" href="#top" aria-label="Hariprasath Nagarajan home"><span>HN</span><i>/</i></a>
        <nav className={`topnav ${menuOpen ? 'topnav--open' : ''}`}>
          {navItems.map((item, index) => <a href={item.href} key={item.label} className={activeSection === item.href.slice(1) ? 'is-active' : ''} onClick={() => setMenuOpen(false)}><small>0{index + 1}</small>{item.label}</a>)}
          <a className="topnav__contact" href="#contact" onClick={() => setMenuOpen(false)}>Get in touch <ArrowUpRight size={14} /></a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </header>

      <main className="page-content">
        <section className="hero section-pad" aria-labelledby="hero-title">
          <div className="hero__copy">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="eyebrow"><span className="status-dot" /> Full-stack developer · Python · AI applications</motion.div>
            <motion.h1 id="hero-title" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
              <motion.span variants={reveal}>I build useful</motion.span>
              <motion.span className="hero__headline-indent" variants={reveal}>digital products</motion.span>
              <motion.span className="hero__headline-accent" variants={reveal}>from complex ideas.</motion.span>
            </motion.h1>
            <motion.p className="hero__intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65, duration: 0.7 }}>
              I&apos;m a computer science postgraduate and developer focused on responsive web applications, practical backend systems, and AI-powered tools. I enjoy turning complicated requirements into simple, reliable experiences.
            </motion.p>
            <motion.div className="hero__role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.72 }} aria-live="polite"><span>Currently working as</span><strong key={roles[roleIndex]}>{roles[roleIndex]}</strong></motion.div>
            <motion.div className="hero__actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}><a className="button button--solid" href="#work">Explore my work <ArrowDownRight size={16} /></a><a className="text-link" href="#contact">Get in touch <ArrowUpRight size={15} /></a></motion.div>
          </div>
          <motion.div className="hero__portrait-wrap" initial={{ opacity: 0, scale: 0.94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: -2 }} transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}><div className="hero__portrait-frame"><img src="/photo.jpeg" alt="Hariprasath Nagarajan in a studio portrait" /><span className="hero__portrait-caption">Developer / Trichy, India</span></div></motion.div>
          <div className="hero__meta"><span>↓ Scroll to see the work</span><span>Open to full-stack, Python & AI roles</span></div>
        </section>

        <section className="section-pad about-section" id="about" aria-labelledby="about-title">
          <motion.div className="about-section__left" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}><SectionLabel number="01">About me</SectionLabel><h2 id="about-title">Practical software,<br /><em>careful details.</em></h2><p className="about-section__lede">I&apos;m interested in building software that solves a real problem and is pleasant to use.</p><p>My work spans full-stack web development, Python applications, and AI-powered tools. I enjoy working across the frontend and backend — designing clear interfaces, building APIs, connecting databases, and improving application workflows.</p><p>During my internship at VDart Academy, I have contributed to live website projects, including a complete website redesign, client-based website development from scratch, and a booking website developed from scratch.</p><a className="text-link" href="https://linkedin.com/in/hariprasath-nagarajan" target="_blank" rel="noreferrer">More on LinkedIn <ArrowUpRight size={15} /></a></motion.div>
          <motion.div className="about-section__right" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal}><div className="quote-card"><span>“</span><p>I learn by making things, breaking them, and trying to understand why they broke.</p><small>— Hariprasath</small></div><div className="profile-facts"><div><span>Based in</span><strong>Trichy, Tamil Nadu</strong></div><div><span>Focus</span><strong>Full-stack + Python + AI</strong></div><div><span>Open to</span><strong>Developer opportunities</strong></div></div></motion.div>
        </section>

        <section className="experience-section" id="experience" aria-labelledby="experience-title"><div className="section-pad experience-section__inner"><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}><SectionLabel number="02">Experience</SectionLabel><h2 id="experience-title">Learning by<br /><em>shipping.</em></h2></motion.div><motion.div className="experience-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal}><div className="experience-card__top"><div><span className="experience-card__eyebrow"><BriefcaseBusiness size={14} /> Internship</span><h3>Full-Stack Developer Intern</h3><p>VDart Academy · Trichy, Tamil Nadu</p></div><span className="experience-card__date">July 2025 — Present</span></div><p className="experience-card__summary">I contribute to live website projects by translating business goals and client requirements into functional, responsive digital experiences.</p><div className="experience-card__work"><span>Work included</span><div><b>VDart Academy</b><b>Website redesign</b><b>VNavigate</b><b>Built from scratch</b><b>VBooking</b><b>Built from scratch</b></div></div></motion.div></div></section>

        <section className="section-pad live-work-section" id="live-work" aria-labelledby="live-title"><motion.div className="section-heading" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}><SectionLabel number="03">Real-world website contributions</SectionLabel><div className="section-heading__title-row"><h2 id="live-title">Work that went<br /><em>live.</em></h2><p>Projects I contributed to during my internship. Contribution notes are kept separate from the overall project description.</p></div></motion.div><div className="live-grid">{liveSites.map((site, index) => <motion.article className={`live-card live-card--${site.accent}`} key={site.name} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.08, duration: 0.6 } } }}><div className="live-card__preview"><span>LIVE WEBSITE</span><div className="live-card__preview-mark">{site.name.slice(0, 1)}</div><small>Screenshot placeholder — add confirmed preview</small></div><div className="live-card__body"><div className="project-row__topline"><span>{site.category}</span><span>{site.number}</span></div><h3>{site.name}</h3><p className="live-card__contribution">{site.contribution}</p><p>{site.description}</p><div className="live-card__footer"><span>Developer Intern · VDart Academy</span><a href={site.href} target="_blank" rel="noreferrer">Visit website <ExternalLink size={14} /></a></div></div></motion.article>)}</div></section>

        <section className="section-pad work-section" id="work" aria-labelledby="work-title"><motion.div className="section-heading" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}><SectionLabel number="04">Featured projects</SectionLabel><div className="section-heading__title-row"><h2 id="work-title">Projects from<br /><em>the workbench.</em></h2><p>Practical technical projects covering AI applications, full-stack products, and realtime web experiences.</p></div></motion.div><div className="featured-list">{featuredProjects.map((project, index) => <motion.a className={`featured-row featured-row--${project.accent}`} href={project.href} target="_blank" rel="noreferrer" key={project.number} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.06, duration: 0.6 } } }}><div className="featured-row__number">{project.number}</div><div className="featured-row__main"><div className="project-row__topline"><span>{project.category}</span><span>GitHub</span></div><h3>{project.title}</h3><p>{project.description}</p><div className="featured-row__features">{project.features.map((feature) => <span key={feature}>{feature}</span>)}</div><div className="tag-list">{project.stack.map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className="project-row__arrow"><ArrowUpRight size={24} /></div></motion.a>)}</div><div className="work-section__footer"><span>More repositories and unfinished experiments</span><a className="text-link" href="https://github.com/Hariprasathnagarajan" target="_blank" rel="noreferrer">See GitHub <ArrowUpRight size={15} /></a></div></section>

        <section className="skills-section" id="skills" aria-labelledby="skills-title"><div className="section-pad skills-section__inner"><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}><SectionLabel number="05">Technical skills</SectionLabel><h2 id="skills-title">Tools I can<br /><em>explain.</em></h2><p className="skills-section__intro">No percentage bars — just the technologies I use and can discuss in an interview.</p></motion.div><div className="skill-selector" role="tablist" aria-label="Technical skill categories">{skillGroups.map((group, index) => { const Icon = group.icon; return <button className={skillIndex === index ? 'is-selected' : ''} key={group.label} onClick={() => setSkillIndex(index)} role="tab" aria-selected={skillIndex === index}><Icon size={17} />{group.label}</button> })}</div><motion.div className="skill-detail" key={skillGroups[skillIndex].label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}><span>{skillGroups[skillIndex].label}</span><h3>{skillGroups[skillIndex].tools}</h3><p>{skillGroups[skillIndex].detail}</p></motion.div></div></section>

        <section className="approach-section" id="approach" aria-labelledby="approach-title"><div className="section-pad approach-section__inner"><motion.div className="approach-section__intro" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}><SectionLabel number="06">How I build</SectionLabel><h2 id="approach-title">From question<br />to <em>working software.</em></h2><p>I like understanding the real problem before reaching for a library. The process is simple, but it keeps the work grounded.</p></motion.div><div className="build-steps">{buildSteps.map(([number, title, description]) => <div className="build-step" key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></div>)}</div></div></section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title"><div className="section-pad contact-section__inner"><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={reveal}><SectionLabel number="07">Get in touch</SectionLabel><h2 id="contact-title">Have a project<br /><em>or opportunity?</em></h2><p>I&apos;m open to full-stack development, Python development, and AI application development opportunities.</p><div className="contact-actions"><a className="button button--light" href="mailto:hariprasathnagarajan24@gmail.com">Email me <Mail size={16} /></a><button className="button button--outline" onClick={copyEmail}>{copied ? <><Check size={16} /> Copied</> : <>Copy email <ArrowUpRight size={16} /></>}</button></div></motion.div><div className="contact-section__details"><a href="mailto:hariprasathnagarajan24@gmail.com"><Mail size={16} /><span>hariprasathnagarajan24@gmail.com</span></a><span><MapPin size={16} /><span>Trichy, Tamil Nadu, India</span></span><div className="contact-section__socials"><a href="https://github.com/Hariprasathnagarajan" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={19} /></a><a href="https://linkedin.com/in/hariprasath-nagarajan" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={19} /></a></div></div></div></section>
      </main>
      <footer className="footer section-pad"><span>HN/ — built in Trichy, with too many browser tabs open.</span><span>© {new Date().getFullYear()} Hariprasath Nagarajan</span><a href="#top">Back to top <ArrowUpRight size={14} /></a></footer>
    </div>
  )
}

export default App
