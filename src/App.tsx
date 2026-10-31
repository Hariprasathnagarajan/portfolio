import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring, type Variants } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  Clock3,
  Code2,
  Database,
  Mail,
  MapPin,
  Menu,
  Terminal,
  X,
} from 'lucide-react'
import { Github, Linkedin } from './lib/icons'
import './App.css'

const navItems = [
  { label: 'Index', href: '#top' },
  { label: 'Work', href: '#work' },
  { label: 'Approach', href: '#approach' },
  { label: 'About', href: '#about' },
]

const projects = [
  {
    number: '01',
    year: '2025',
    title: 'Research paper / RAG',
    type: 'Generative AI · Local-first',
    description:
      'A grounded question-answering tool that lets a researcher move from a dense PDF to a useful answer without losing the source context.',
    stack: ['Python', 'LangChain', 'FAISS', 'LLaMA 2'],
    accent: 'amber',
    href: 'https://github.com/Hariprasathnagarajan',
  },
  {
    number: '02',
    year: '2025',
    title: 'Python / AI assistant',
    type: 'LLM application · Learning tool',
    description:
      'A friendly coding companion shaped around beginner questions, structured prompts, and explanations that do not talk down to the person asking.',
    stack: ['Python', 'Ollama', 'LLaMA 3', 'Streamlit'],
    accent: 'blue',
    href: 'https://github.com/Hariprasathnagarajan',
  },
  {
    number: '03',
    year: '2025',
    title: 'Learning management system',
    type: 'Full stack · Product interface',
    description:
      'A responsive education platform with JWT authentication, course management, and a component system built to stay legible as the product grows.',
    stack: ['React', 'Django REST', 'PostgreSQL', 'Tailwind'],
    accent: 'coral',
    href: 'https://github.com/Hariprasathnagarajan',
  },
  {
    number: '04',
    year: '2024',
    title: 'Real-time meeting platform',
    type: 'Realtime systems · WebRTC',
    description:
      'Video, audio, screen sharing, and live messages in one focused room experience — a practical study in the parts users never see.',
    stack: ['Next.js', 'TypeScript', 'WebRTC', 'WebSockets'],
    accent: 'violet',
    href: 'https://github.com/Hariprasathnagarajan',
  },
]

const capabilities = [
  {
    icon: BrainCircuit,
    label: 'Generative AI',
    description: 'LLM products, prompt systems, RAG pipelines, and evaluation-minded prototypes.',
  },
  {
    icon: Terminal,
    label: 'Python systems',
    description: 'FastAPI services, clean integrations, automation, and backend logic that stays understandable.',
  },
  {
    icon: Code2,
    label: 'Product frontend',
    description: 'React interfaces that make the technical story feel clear, fast, and worth using.',
  },
  {
    icon: Database,
    label: 'Data in context',
    description: 'Embeddings, vector search, relational data, and the connective tissue between them.',
  },
]

const tools = ['Python', 'React', 'TypeScript', 'FastAPI', 'LangChain', 'FAISS', 'PostgreSQL', 'Git', 'Flutter', 'Django']

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

function SectionLabel({ number, children }: { number: string; children: string }) {
  return (
    <div className="section-label">
      <span className="section-label__number">{number}</span>
      <span className="section-label__line" />
      <span>{children}</span>
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('top')
  const [copied, setCopied] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const sections = ['top', 'work', 'approach', 'about', 'contact']
    const onScroll = () => {
      const current = sections.reduce((found, id) => {
        const element = document.getElementById(id)
        if (element && window.scrollY + 180 >= element.offsetTop) return id
        return found
      }, 'top')
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
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
        <a className="wordmark" href="#top" aria-label="Hariprasath Nagarajan home">
          <span>HN</span><i>/</i>
        </a>
        <div className="side-rail__rule" />
        <span className="side-rail__vertical">AI ENGINEER · PYTHON DEVELOPER</span>
        <span className="side-rail__index">{String(navItems.findIndex((item) => item.href === `#${activeSection}`) + 1 || 1).padStart(2, '0')} / 05</span>
      </aside>

      <header className="topbar">
        <a className="wordmark wordmark--mobile" href="#top" aria-label="Hariprasath Nagarajan home">
          <span>HN</span><i>/</i>
        </a>
        <nav className={`topnav ${menuOpen ? 'topnav--open' : ''}`}>
          {navItems.map((item, index) => (
            <a
              href={item.href}
              key={item.label}
              className={activeSection === item.href.slice(1) ? 'is-active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              <small>0{index + 1}</small>{item.label}
            </a>
          ))}
          <a className="topnav__contact" href="#contact" onClick={() => setMenuOpen(false)}>
            Start a conversation <ArrowUpRight size={14} />
          </a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <main className="page-content">
        <section className="hero section-pad" aria-labelledby="hero-title">
          <div className="hero__copy">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="eyebrow">
              <span className="status-dot" /> AI engineer · Python developer · Trichy
            </motion.div>
            <motion.h1 id="hero-title" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
              <motion.span variants={reveal}>I build tools</motion.span>
              <motion.span className="hero__headline-indent" variants={reveal}>people can</motion.span>
              <motion.span className="hero__headline-accent" variants={reveal}>actually use.</motion.span>
            </motion.h1>
            <motion.p className="hero__intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65, duration: 0.7 }}>
              I work mostly in Python, React, and the space between a useful idea and a working product. Lately that has meant RAG tools, APIs, and small interfaces for large problems.
            </motion.p>
            <motion.div className="hero__actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}>
              <a className="button button--solid" href="#work">See selected work <ArrowDownRight size={16} /></a>
              <a className="text-link" href="mailto:hariprasathnagarajan24@gmail.com">Say hello <ArrowUpRight size={15} /></a>
            </motion.div>
          </div>

          <motion.div className="hero__portrait-wrap" initial={{ opacity: 0, scale: 0.94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: -2 }} transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}>
            <div className="hero__portrait-frame">
              <img src="/photo.jpeg" alt="Hariprasath Nagarajan in a studio portrait" />
              <span className="hero__portrait-caption">01 / portrait study</span>
            </div>
          </motion.div>

          <div className="hero__meta">
            <span>↓ Scroll to see the work</span>
            <span>Trichy, Tamil Nadu · India</span>
            <span className="hero__meta-last">Open to AI & software roles</span>
          </div>
        </section>

        <section className="section-pad work-section" id="work" aria-labelledby="work-title">
          <motion.div className="section-heading" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}>
            <SectionLabel number="01" >Things I have built</SectionLabel>
            <div className="section-heading__title-row">
              <h2 id="work-title">A few things<br />I&apos;ve <em>made.</em></h2>
              <p>Projects from coursework, freelance work, and the rabbit holes that turned into something useful.</p>
            </div>
          </motion.div>

          <div className="project-list">
            {projects.map((project, index) => (
              <motion.a className={`project-row project-row--${project.accent}`} href={project.href} target="_blank" rel="noreferrer" key={project.number} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.06, duration: 0.65 } } }}>
                <div className="project-row__number">{project.number}</div>
                <div className="project-row__main">
                  <div className="project-row__topline"><span>{project.type}</span><span>{project.year}</span></div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="tag-list">{project.stack.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </div>
                <div className="project-row__arrow"><ArrowUpRight size={24} /></div>
              </motion.a>
            ))}
          </div>
          <div className="work-section__footer">
            <span>There is more on GitHub, including the unfinished bits</span>
            <a className="text-link" href="https://github.com/Hariprasathnagarajan" target="_blank" rel="noreferrer">See GitHub <ArrowUpRight size={15} /></a>
          </div>
        </section>

        <section className="approach-section" id="approach" aria-labelledby="approach-title">
          <div className="section-pad approach-section__inner">
            <motion.div className="approach-section__intro" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}>
              <SectionLabel number="02">How I work</SectionLabel>
              <h2 id="approach-title">Start with the<br /><em>actual problem.</em></h2>
              <p>I like understanding the boring details first: who is using the thing, what they already tried, and what would make their day a little easier.</p>
            </motion.div>
            <div className="capability-list">
              {capabilities.map(({ icon: Icon, label, description }, index) => (
                <motion.div className="capability" key={label} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ hidden: { opacity: 0, x: 18 }, visible: { opacity: 1, x: 0, transition: { delay: index * 0.08, duration: 0.6 } } }}>
                  <div className="capability__index">0{index + 1}</div>
                  <Icon size={19} strokeWidth={1.5} />
                  <div><h3>{label}</h3><p>{description}</p></div>
                  <ArrowUpRight size={16} className="capability__arrow" />
                </motion.div>
              ))}
            </div>
            <div className="tool-wall">
              <span className="tool-wall__label">Current toolkit</span>
              <div className="tool-wall__items">{tools.map((tool) => <span key={tool}>{tool}</span>)}</div>
            </div>
          </div>
        </section>

        <section className="section-pad about-section" id="about" aria-labelledby="about-title">
          <motion.div className="about-section__left" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}>
              <SectionLabel number="03">A little about me</SectionLabel>
              <h2 id="about-title">Still figuring<br />things <em>out.</em></h2>
              <p className="about-section__lede">I learn by making things, breaking them, and then trying to explain why they broke.</p>
              <p>My background is in Python and full-stack development. I have built AI assistants, search tools, REST APIs, learning platforms, and a few projects that are probably more useful as lessons than products. That is fine too.</p>
            <a className="text-link" href="https://linkedin.com/in/hariprasath-nagarajan" target="_blank" rel="noreferrer">More on LinkedIn <ArrowUpRight size={15} /></a>
          </motion.div>
          <motion.div className="about-section__right" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal}>
            <div className="timeline-card">
              <div className="timeline-card__heading"><Clock3 size={17} /><span>Where I spend my time</span></div>
              <div className="timeline-item"><span>These days</span><strong>AI tools and backend work</strong><p>Python, RAG, FastAPI, and trying to keep the data flow understandable.</p></div>
              <div className="timeline-item"><span>Recently</span><strong>Full-stack projects</strong><p>React interfaces, booking flows, and real-time browser features.</p></div>
              <div className="timeline-item"><span>Usually</span><strong>Learning by shipping</strong><p>Reading docs, asking questions, and keeping the useful parts.</p></div>
            </div>
            <div className="quote-card"><span>“</span><p>Most useful ideas start as questions I cannot leave alone.</p><small>— Hariprasath</small></div>
          </motion.div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="section-pad contact-section__inner">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={reveal}>
              <SectionLabel number="04">Get in touch</SectionLabel>
              <h2 id="contact-title">Have a<br /><em>good question?</em></h2>
              <p>If you are building something with AI, need help getting a prototype over the line, or just want to compare notes, send me a message.</p>
              <div className="contact-actions">
                <a className="button button--light" href="mailto:hariprasathnagarajan24@gmail.com">Email me <Mail size={16} /></a>
                <button className="button button--outline" onClick={copyEmail}>{copied ? <><Check size={16} /> Copied</> : <>Copy email <ArrowUpRight size={16} /></>}</button>
              </div>
            </motion.div>
            <div className="contact-section__details">
              <a href="mailto:hariprasathnagarajan24@gmail.com"><Mail size={16} /><span>hariprasathnagarajan24@gmail.com</span></a>
              <span><MapPin size={16} /><span>Trichy, Tamil Nadu, India</span></span>
              <div className="contact-section__socials"><a href="https://github.com/Hariprasathnagarajan" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={19} /></a><a href="https://linkedin.com/in/hariprasath-nagarajan" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={19} /></a></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer section-pad">
        <span>HN/ — built in Trichy, with too many browser tabs open.</span>
        <span>© {new Date().getFullYear()} Hariprasath Nagarajan</span>
        <a href="#top">Back to top <ArrowUpRight size={14} /></a>
      </footer>
    </div>
  )
}

export default App
