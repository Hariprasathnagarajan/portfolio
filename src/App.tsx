import { useEffect, useState, useId } from 'react'
import { motion, useScroll, useSpring, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  GraduationCap,
  Layers,
  Lock,
  Mail,
  MapPin,
  Menu,
  Radio,
  Send,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react'
import { Github, Linkedin } from './lib/icons'
import { CustomCursor } from './components/CustomCursor'
import { ConnectedNodesCanvas } from './components/ConnectedNodesCanvas'
import { TerminalModal } from './components/TerminalModal'
import { ProjectTiltCard } from './components/ProjectTiltCard'
import { LiveContributionCard } from './components/LiveContributionCard'
import { InteractiveSkills } from './components/InteractiveSkills'
import { InteractiveApproach } from './components/InteractiveApproach'
import type {
  Contribution,
  FeaturedProject,
  OpenSourceProject,
  TimelineEntry,
} from './types'
import './App.css'

const navItems = [
  { label: 'Index', href: '#top' },
  { label: 'Live Work', href: '#contributions' },
  { label: 'Projects', href: '#projects' },
  { label: 'Open Source', href: '#open-source' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Approach', href: '#approach' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

const cyclingRoles = [
  'Full-Stack Developer',
  'Python Developer',
  'AI Application Developer',
]

const liveContributions: Contribution[] = [
  {
    id: 'vdart-academy',
    title: 'VDart Academy',
    subtitle: 'Complete Website Redesign',
    url: 'https://vdartacademy.com/',
    role: 'Developer Intern',
    category: 'Website Redesign · Education & Training',
    badgeLabel: 'Complete Website Redesign',
    description:
      'Redesigned the VDart Academy website to improve its visual presentation, user experience, and overall website structure.',
    contributionPoints: [
      'Redesigned the website’s overall visual identity and layout.',
      'Improved page structure and content presentation.',
      'Created a more modern and consistent user interface.',
      'Focused on responsive design and usability.',
      'Refined website sections to better communicate training programs and academy information.',
    ],
    technologies: [
      'HTML5',
      'CSS3 / Tailwind',
      'JavaScript',
      'Responsive Web Design',
      'UI/UX Layouts',
      '[Add confirmed technologies]',
    ],
    iconUrl: '/vdart-icon.png',
    accentColor: '#069494',
  },
  {
    id: 'vnavigate',
    title: 'VNavigate',
    subtitle: 'Website Design & Development from Scratch',
    url: 'https://vnavigate.com/',
    role: 'Developer Intern — VDart Academy',
    category: 'Website Design · Client-Based Development',
    badgeLabel: 'Designed & Developed from Scratch',
    description:
      'Designed and developed the VNavigate website from scratch, creating a digital experience aligned with the client’s business goals, service offerings, and requirements.',
    contributionPoints: [
      'Designed the website structure and user interface from scratch.',
      'Developed the website based on the client’s needs and business requirements.',
      'Updated and refined website sections based on client feedback.',
      'Adapted the design and content presentation to meet changing requirements.',
      'Focused on usability, responsive layouts, and a professional corporate experience.',
    ],
    technologies: [
      'HTML5',
      'CSS3',
      'JavaScript',
      'Client UI Design',
      'Responsive Layouts',
      '[Add confirmed technologies]',
    ],
    iconUrl: '/vnavigate-icon.png',
    accentColor: '#2563eb',
  },
  {
    id: 'vbooking',
    title: 'VBooking',
    subtitle: 'Website Development from Scratch',
    url: 'https://vbooking.com/',
    role: 'Developer Intern — VDart Academy',
    category: 'Website Development · Booking Platform',
    badgeLabel: 'Developed from Scratch',
    description:
      'Developed the VBooking website from scratch, contributing to the creation of a functional and user-friendly digital booking experience.',
    contributionPoints: [
      'Developed the website from the ground up.',
      'Implemented website structure and user interface components.',
      'Focused on usability and responsive design.',
      'Built website functionality based on project requirements.',
      '[Add the specific booking features or workflows you implemented.]',
    ],
    technologies: [
      'HTML5',
      'CSS3 / Tailwind',
      'JavaScript',
      'Booking UI Components',
      'Responsive Design',
      '[Add confirmed technologies]',
    ],
    iconUrl: '/vbooking-icon.png',
    accentColor: '#10b981',
  },
]

const featuredProjects: FeaturedProject[] = [
  {
    number: '01',
    year: '2025',
    title: 'AI Document Research Assistant',
    category: 'AI Application · Python',
    description:
      'An AI-powered research assistant that helps users explore documents, retrieve relevant information, and generate answers grounded in uploaded content.',
    problemSolved:
      'Manually reading through dense technical PDFs or multi-page research documents to find specific answers takes hours, and generic LLMs frequently hallucinate without grounded context or source citations.',
    keyFeatures: [
      'Document upload and semantic chunking for multi-page documents',
      'Vector indexing and similarity search using FAISS',
      'Retrieval-Augmented Generation (RAG) pipeline for grounded responses',
      'Context-aware question answering with source citations and references',
      'Clean, accessible user interface designed for research workflows',
    ],
    stack: ['Python', 'LangChain', 'FAISS', 'LLM API', 'Streamlit'],
    githubUrl: 'https://github.com/Hariprasathnagarajan',
    statusLabel: 'Architecture & Repository',
    accent: 'amber',
  },
  {
    number: '02',
    year: '2025',
    title: 'Learning Management System',
    category: 'Full-Stack Web Application',
    description:
      'A learning platform that supports course discovery, user management, and learning-related workflows.',
    problemSolved:
      'Educational platforms often suffer from confusing course navigation, rigid role boundaries, and difficult administrative tracking of enrollments.',
    keyFeatures: [
      'Role-based access control with secure JWT authentication',
      'Dynamic course catalog, syllabus breakdown, and module views',
      'Student profile management and course enrollment tracking',
      'Instructor course creation and lesson publishing tools',
      'Administrative controls for user access and platform overview',
    ],
    stack: ['React', 'TypeScript', 'Django REST Framework', 'PostgreSQL', 'Tailwind CSS', 'JWT'],
    githubUrl: 'https://github.com/Hariprasathnagarajan',
    statusLabel: 'Full-Stack Repository',
    accent: 'blue',
  },
  {
    number: '03',
    year: '2024',
    title: 'Real-Time Meeting Platform',
    category: 'Web Application · Real-Time Communication',
    description:
      'A web application focused on real-time communication and collaborative meeting workflows.',
    problemSolved:
      'Enabling dependable, low-latency peer-to-peer audio and video streaming directly inside the browser with resilient room state handling and intuitive participant controls.',
    keyFeatures: [
      'Instant room creation and unique shareable invitation links',
      'Peer-to-peer real-time audio and video feeds via WebRTC',
      'Low-latency in-meeting text chat and live status synchronization',
      'Participant media controls (mute mic, toggle video, screen sharing)',
      'Responsive interface optimized for desktop and mobile viewports',
    ],
    stack: ['Next.js', 'TypeScript', 'WebRTC', 'WebSockets', 'Tailwind CSS'],
    githubUrl: 'https://github.com/Hariprasathnagarajan',
    statusLabel: 'Interactive Prototype',
    accent: 'coral',
  },
  {
    number: '04',
    year: '2025',
    title: 'Python AI Assistant',
    category: 'Python · AI Application',
    description:
      'A Python-based assistant designed to simplify repetitive tasks and provide an accessible interface for interacting with AI-powered functionality.',
    problemSolved:
      'Developers and learners need quick task automation, coding explanations, and prompt structuring without cumbersome desktop configurations.',
    keyFeatures: [
      'Task automation utilities and structured query processing',
      'Step-by-step code guidance with clear, accessible explanations',
      'Local model integration via Ollama for zero-cost, private execution',
      'Lightweight, responsive interface designed for immediate task execution',
    ],
    stack: ['Python', 'Ollama', 'LLaMA 3', 'Streamlit', 'FastAPI'],
    githubUrl: 'https://github.com/Hariprasathnagarajan',
    statusLabel: 'Utility & Repository',
    accent: 'violet',
  },
]

const openSourceProjects: OpenSourceProject[] = [
  {
    id: 'asset-management',
    number: 'A',
    title: 'Asset Management & Tracking System',
    category: 'Full-Stack Enterprise Architecture',
    purpose:
      'Track company hardware and software assets, assign them to employees, and maintain comprehensive asset history and audit logs.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Django REST Framework', 'JWT', 'PostgreSQL / SQLite'],
    keyFeatures: [
      'Role-based JWT authentication and permission boundaries (Admin, Staff, Employee)',
      'Asset creation, categorization, status tracking, and condition logs',
      'Employee directory with asset checkout, assignment, and return workflows',
      'Filterable search, status tagging, and paginated query endpoints',
      'Historical audit trail of asset transfers and maintenance changes',
      'Interactive dashboard overview metrics and REST API documentation',
    ],
    status: 'In Development · Core Spec Ready',
    githubUrl: 'https://github.com/Hariprasathnagarajan',
    isRecommendedFirst: true,
  },
  {
    id: 'cafeteria-management',
    number: 'B',
    title: 'Cafeteria Management System',
    category: 'Enterprise Workflow & Billing',
    purpose:
      'Manage cafeteria menus, employee meal orders, daily limits, and monthly billing records.',
    stack: ['Python', 'Django', 'PostgreSQL', 'Tailwind CSS', 'REST API'],
    keyFeatures: [
      'Three-tier roles: Administrator, Cafeteria Staff, Employee',
      'Menu scheduling, item pricing, and daily meal availability toggles',
      'Order placement engine with automated daily meal quota enforcement',
      'Monthly billing report generation with employee aggregate calculations',
      'Data export options supporting CSV, Excel, and printable PDF formats',
    ],
    status: 'In Development',
    githubUrl: 'https://github.com/Hariprasathnagarajan',
  },
  {
    id: 'slot-management',
    number: 'C',
    title: 'Smart Booking & Slot Management System',
    category: 'Scheduling Engine & Backend API',
    purpose:
      'Manage room and resource bookings through configurable time slots with automatic conflict resolution.',
    stack: ['Python', 'FastAPI', 'PostgreSQL / SQLite', 'React', 'Tailwind CSS'],
    keyFeatures: [
      'Configurable slot creation with dynamic intervals and blackout rules',
      'Atomic availability verification preventing double-booking conflicts',
      'Self-service booking, rescheduling, and cancellation workflows',
      'Administrator console for manual overrides and capacity thresholds',
      'Complete booking history logging with status audit timestamps',
    ],
    status: 'In Development',
    githubUrl: 'https://github.com/Hariprasathnagarajan',
  },
  {
    id: 'portfolio-cms',
    number: 'D',
    title: 'Developer Portfolio CMS',
    category: 'Headless Content Architecture',
    purpose:
      'Build a lightweight content management system that allows a developer to update portfolio projects, skills, and profile content without editing frontend code.',
    stack: ['Django REST Framework', 'Python', 'React', 'Tailwind CSS', 'SQLite'],
    keyFeatures: [
      'Admin authentication with protected management routes',
      'Full CRUD operations for projects, skills, and timeline achievements',
      'Contact inquiry message inbox and notification tracking',
      'Clean JSON REST API endpoints consumed by responsive portfolio frontends',
    ],
    status: 'In Development',
    githubUrl: 'https://github.com/Hariprasathnagarajan',
  },
]

const timelineEntries: TimelineEntry[] = [
  {
    period: 'July 2025 – Present',
    role: 'Full-Stack Developer Intern',
    organization: 'VDart Academy | Trichy, Tamil Nadu',
    location: 'Trichy, Tamil Nadu',
    summary:
      'During my internship at VDart Academy, I have contributed to the redesign and development of live websites, translating business goals and client requirements into functional and user-friendly digital experiences. My work includes redesigning the VDart Academy website, designing and developing VNavigate from scratch based on client requirements, and developing VBooking from scratch.',
    internshipProjects: liveContributions,
    technologies: [
      'Website Redesign',
      'Client-Based Development',
      'Booking Platform Development',
      'UI/UX Design',
      'Visual Hierarchy',
      'Responsive Web Design',
    ],
  },
  {
    period: 'Postgraduate Studies',
    role: 'Computer Science Postgraduate',
    organization: 'Academic Education',
    location: 'Trichy, Tamil Nadu',
    summary:
      'Studied core computer science principles: advanced software engineering, relational database architectures, algorithms, backend systems, and applied AI methods.',
    technologies: ['Computer Science', 'Data Structures', 'Python', 'Web Architectures'],
  },
]

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
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
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [roleIndex, setRoleIndex] = useState(0)
  const [headlineOffset, setHeadlineOffset] = useState({ x: 0, y: 0 })
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    '01': true,
  })

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Full-Stack Opportunity',
    message: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const nameInputId = useId()
  const emailInputId = useId()
  const subjectInputId = useId()
  const messageInputId = useId()

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  // Cycle role text every 3.2 seconds
  useEffect(() => {
    const roleTimer = window.setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % cyclingRoles.length)
    }, 3200)
    return () => window.clearInterval(roleTimer)
  }, [])

  // Keyboard shortcut for Easter Egg Terminal (Ctrl+Shift+K or typing 'dev')
  useEffect(() => {
    let keyBuffer: string[] = []
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isInput = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault()
        setTerminalOpen((prev) => !prev)
        return
      }

      if (!isInput) {
        if (e.key === '`' || e.key === '~') {
          e.preventDefault()
          setTerminalOpen((prev) => !prev)
          return
        }

        keyBuffer.push(e.key.toLowerCase())
        if (keyBuffer.length > 5) keyBuffer.shift()
        if (keyBuffer.join('').includes('dev')) {
          setTerminalOpen(true)
          keyBuffer = []
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Active section scroll detection
  useEffect(() => {
    const sections = [
      'top',
      'contributions',
      'projects',
      'open-source',
      'skills',
      'experience',
      'approach',
      'about',
      'contact',
    ]

    const onScroll = () => {
      const current = sections.reduce((found, id) => {
        const element = document.getElementById(id)
        if (element && window.scrollY + 200 >= element.offsetTop) return id
        return found
      }, 'top')
      setActiveSection(current)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard?.writeText('hariprasathnagarajan24@gmail.com')
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  const toggleProjectExpand = (projectNumber: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectNumber]: !prev[projectNumber],
    }))
  }

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (window.innerWidth < 980) return
    const { clientX, clientY } = e
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const ox = ((clientX - centerX) / centerX) * 8
    const oy = ((clientY - centerY) / centerY) * 8
    setHeadlineOffset({ x: ox, y: oy })
  }

  const handleHeroMouseLeave = () => {
    setHeadlineOffset({ x: 0, y: 0 })
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) {
      errors.name = 'Please provide your name.'
    }
    if (!formData.email.trim()) {
      errors.email = 'Please provide your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please provide a valid email address.'
    }
    if (!formData.message.trim()) {
      errors.message = 'Please enter a message.'
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Please provide a message with at least 10 characters.'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setFormSubmitting(true)
    window.setTimeout(() => {
      setFormSubmitting(false)
      setFormSubmitted(true)
    }, 450)
  }

  const activeIndex = Math.max(
    1,
    navItems.findIndex((item) => item.href === `#${activeSection}`) + 1
  )

  return (
    <div className="site-shell" id="top">
      {/* Custom Minimal Desktop Cursor */}
      <CustomCursor />

      {/* Developer Terminal Easter Egg */}
      <TerminalModal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />

      {/* Global Scroll Progress Bar */}
      <motion.div className="scroll-progress" style={{ scaleX: progress }} />

      {/* Desktop Side Rail Index */}
      <aside className="side-rail" aria-label="Portfolio index">
        <a className="wordmark" href="#top" aria-label="Hariprasath Nagarajan home" data-cursor="home">
          <span>HN</span>
          <i>/</i>
        </a>
        <div className="side-rail__rule" />
        <span className="side-rail__vertical">FULL-STACK · PYTHON · AI</span>
        <span className="side-rail__index">
          {String(activeIndex).padStart(2, '0')} / {String(navItems.length).padStart(2, '0')}
        </span>
      </aside>

      {/* Top Navigation */}
      <header className="topbar">
        <a className="wordmark wordmark--mobile" href="#top" aria-label="Hariprasath Nagarajan home">
          <span>HN</span>
          <i>/</i>
        </a>
        <nav className={`topnav ${menuOpen ? 'topnav--open' : ''}`} aria-label="Main Navigation">
          {navItems.map((item, index) => (
            <a
              href={item.href}
              key={item.label}
              className={activeSection === item.href.slice(1) ? 'is-active' : ''}
              onClick={() => setMenuOpen(false)}
              data-cursor="nav"
            >
              <small>0{index + 1}</small>
              {item.label}
            </a>
          ))}
          <a className="topnav__contact" href="#contact" onClick={() => setMenuOpen(false)} data-cursor="chat">
            Get in touch <ArrowUpRight size={14} />
          </a>
        </nav>
        <button
          className="menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Main Page Content */}
      <main className="page-content">
        {/* ========================================================
            HERO SECTION (With Interactive Nodes Canvas & Parallax)
           ======================================================== */}
        <section
          className="hero section-pad"
          aria-labelledby="hero-title"
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
        >
          {/* Interactive Connected Nodes Canvas Background */}
          <ConnectedNodesCanvas />

          <div className="hero__copy">
            {/* Dynamic Cycling Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="eyebrow"
            >
              <span className="status-dot" />
              <span className="eyebrow__prefix">FOCUS:</span>
              <span className="eyebrow__role-slider">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cyclingRoles[roleIndex]}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                    className="eyebrow__role-text"
                  >
                    {cyclingRoles[roleIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.div>

            {/* Staggered Word Reveal with Subtle Mouse Offset */}
            <motion.h1
              id="hero-title"
              style={{
                transform: `translate3d(${headlineOffset.x}px, ${headlineOffset.y}px, 0)`,
                transition: 'transform 0.15s ease-out',
              }}
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.span variants={reveal}>I build useful</motion.span>
              <motion.span className="hero__headline-indent" variants={reveal}>
                digital products
              </motion.span>
              <motion.span className="hero__headline-accent" variants={reveal}>
                from complex ideas.
              </motion.span>
            </motion.h1>

            <motion.p
              className="hero__intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              I’m a computer science postgraduate and developer focused on building responsive web applications,
              practical backend systems, and AI-powered tools. I enjoy turning complex problems into simple,
              reliable, and user-friendly digital experiences.
            </motion.p>

            <motion.div
              className="hero__actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <a
                className="button button--solid hero-cta"
                href="#contributions"
                data-cursor="explore"
              >
                <span>Explore My Work</span>
                <ArrowDownRight size={16} />
              </a>
              <a
                className="button button--outline"
                href="#contact"
                data-cursor="touch"
              >
                <span>Get in Touch</span>
                <ArrowUpRight size={16} />
              </a>
            </motion.div>

            {/* Social Links */}
            <motion.div
              className="hero__socials"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.6 }}
            >
              <span className="hero__socials-label">Connect:</span>
              <a
                href="https://github.com/Hariprasathnagarajan"
                target="_blank"
                rel="noreferrer"
                className="hero__social-link"
                aria-label="GitHub Profile"
                data-cursor="github"
              >
                <Github size={16} />
                <span>GitHub</span>
              </a>
              <span className="hero__social-divider">·</span>
              <a
                href="https://linkedin.com/in/hariprasath-nagarajan"
                target="_blank"
                rel="noreferrer"
                className="hero__social-link"
                aria-label="LinkedIn Profile"
                data-cursor="linkedin"
              >
                <Linkedin size={16} />
                <span>LinkedIn</span>
              </a>
              <span className="hero__social-divider">·</span>
              <a
                href="mailto:hariprasathnagarajan24@gmail.com"
                className="hero__social-link"
                aria-label="Email Address"
                data-cursor="mail"
              >
                <Mail size={16} />
                <span>Email</span>
              </a>
            </motion.div>
          </div>

          {/* Hero Portrait Frame */}
          <motion.div
            className="hero__portrait-wrap"
            initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero__portrait-frame">
              <img src="/photo.jpeg" alt="Hariprasath Nagarajan — Full-Stack Developer & Builder" />
              <span className="hero__portrait-caption">01 / Hariprasath Nagarajan</span>
            </div>
            <div className="hero__stamp">
              <Sparkles size={16} />
              <span>
                BUILD
                <br />
                WITH
                <br />
                INTENT
              </span>
            </div>
            <div className="hero__orbit hero__orbit--one" />
            <div className="hero__orbit hero__orbit--two" />
          </motion.div>

          <div className="hero__meta">
            <span>↓ Scroll to explore</span>
            <span>Based in Trichy, Tamil Nadu</span>
            <span className="hero__meta-last">Open to Full-Stack, Python & AI Roles</span>
          </div>
        </section>

        {/* Ticker banner */}
        <div className="ticker" aria-label="Core Engineering Domains">
          <div className="ticker__track">
            {[...Array(2)]
              .flatMap(() => [
                'Full-Stack Development',
                'Python & Django',
                'AI Applications',
                'RAG Systems',
                'RESTful APIs',
                'Responsive Interfaces',
                'PostgreSQL & SQLite',
                'Live Website Contributions',
              ])
              .map((item, index) => (
                <span key={`${item}-${index}`}>
                  {item}
                  <b>✳</b>
                </span>
              ))}
          </div>
        </div>

        {/* ========================================================
            SECTION 1: REAL-WORLD WEBSITE CONTRIBUTIONS
           ======================================================== */}
        <section
          className="section-pad contributions-section"
          id="contributions"
          aria-labelledby="contributions-title"
        >
          <motion.div
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
          >
            <SectionLabel number="01">Production Work</SectionLabel>
            <div className="section-heading__title-row">
              <h2 id="contributions-title">
                Real-World <em>Website Contributions.</em>
              </h2>
              <p>
                I have contributed to live websites, applying development and problem-solving skills to real-world
                digital experiences.
              </p>
            </div>
          </motion.div>

          <div className="contributions-grid">
            {liveContributions.map((site, index) => (
              <LiveContributionCard key={site.id} site={site} index={index} />
            ))}
          </div>
        </section>

        {/* ========================================================
            SECTION 2: FEATURED PROJECTS (Interactive 3D Tilt Cards)
           ======================================================== */}
        <section className="section-pad projects-section" id="projects" aria-labelledby="projects-title">
          <motion.div
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
          >
            <SectionLabel number="02">Featured Projects</SectionLabel>
            <div className="section-heading__title-row">
              <h2 id="projects-title">
                Grounded <em>software & systems.</em>
              </h2>
              <p>
                Each project explains the real problem solved, practical architecture, implemented features, and
                technologies used.
              </p>
            </div>
          </motion.div>

          <div className="featured-projects-list">
            {featuredProjects.map((project, index) => (
              <ProjectTiltCard
                key={project.number}
                project={project}
                index={index}
                isExpanded={!!expandedProjects[project.number]}
                onToggleExpand={toggleProjectExpand}
              />
            ))}
          </div>

          <div className="work-section__footer">
            <span>Verified repositories and ongoing experiments</span>
            <a
              className="text-link"
              href="https://github.com/Hariprasathnagarajan"
              target="_blank"
              rel="noreferrer"
              data-cursor="github"
            >
              Explore GitHub Profile <ArrowUpRight size={15} />
            </a>
          </div>
        </section>

        {/* ========================================================
            SECTION 3: OPEN SOURCE & TECHNICAL PROJECTS
           ======================================================== */}
        <section
          className="section-pad open-source-section"
          id="open-source"
          aria-labelledby="opensource-title"
        >
          <motion.div
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
          >
            <SectionLabel number="03">Repository Specifications</SectionLabel>
            <div className="section-heading__title-row">
              <h2 id="opensource-title">
                Open Source & <em>Technical Projects.</em>
              </h2>
              <p>
                Demonstrating the ability to build, document, maintain, and structure software with clear data
                contracts and APIs.
              </p>
            </div>
            <div className="opensource-callout">
              <span className="opensource-callout__badge">Development Transparency</span>
              <p>
                Projects actively being built and documented. Modular architectures are published directly to GitHub;
                components awaiting public release are transparently indicated as &ldquo;In Development&rdquo;.
              </p>
            </div>
          </motion.div>

          <div className="opensource-grid">
            {openSourceProjects.map((repo, index) => (
              <motion.article
                key={repo.id}
                className={`opensource-card ${
                  repo.isRecommendedFirst ? 'opensource-card--recommended' : ''
                }`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.08, duration: 0.65 },
                  },
                }}
                data-cursor="code"
              >
                <div className="opensource-card__top">
                  <div className="opensource-card__number-tag">Project {repo.number}</div>
                  <span className="opensource-card__status-tag">{repo.status}</span>
                </div>

                <div className="opensource-card__main">
                  <span className="opensource-card__category">{repo.category}</span>
                  <h3 className="opensource-card__title">{repo.title}</h3>
                  <p className="opensource-card__purpose">
                    <strong>Purpose:</strong> {repo.purpose}
                  </p>

                  <div className="opensource-card__features">
                    <span className="opensource-card__features-title">Architecture Highlights:</span>
                    <ul>
                      {repo.keyFeatures.map((feat) => (
                        <li key={feat}>
                          <span className="bullet-dash">–</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="opensource-card__bottom">
                  <div className="tag-list">
                    {repo.stack.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <a
                    href={repo.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link opensource-card__link"
                    aria-label={`View ${repo.title} on GitHub`}
                  >
                    <span>View Repository Specs</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ========================================================
            SECTION 4: TECHNICAL SKILLS (Interactive Category Visualization)
           ======================================================== */}
        <section className="section-pad skills-section" id="skills" aria-labelledby="skills-title">
          <motion.div
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
          >
            <SectionLabel number="04">Core Competencies</SectionLabel>
            <div className="section-heading__title-row">
              <h2 id="skills-title">
                Technical <em>Skills.</em>
              </h2>
              <p>
                Interactive visualization of engineering domains. Select any category to inspect relevant technologies
                and how I apply them to build real digital products.
              </p>
            </div>
          </motion.div>

          {/* Interactive Skills Component with Tabbed Animations */}
          <InteractiveSkills />
        </section>

        {/* ========================================================
            SECTION 5: EXPERIENCE & CONTRIBUTION TIMELINE
           ======================================================== */}
        <section
          className="section-pad experience-section"
          id="experience"
          aria-labelledby="experience-title"
        >
          <motion.div
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
          >
            <SectionLabel number="05">Background & Timeline</SectionLabel>
            <div className="section-heading__title-row">
              <h2 id="experience-title">
                Experience & <em>Contributions.</em>
              </h2>
              <p>
                A record of practical software development, live website contributions, and academic foundation.
              </p>
            </div>
          </motion.div>

          <div className="timeline-container">
            {timelineEntries.map((entry, index) => (
              <motion.article
                key={entry.role}
                className="timeline-block"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { delay: index * 0.1, duration: 0.65 },
                  },
                }}
              >
                <div className="timeline-block__marker">
                  <div className="timeline-block__dot" />
                  <div className="timeline-block__line" />
                </div>

                <div className="timeline-block__body">
                  <div className="timeline-block__top">
                    <Clock3 size={13} className="timeline-clock-icon" />
                    <span className="timeline-block__period">{entry.period}</span>
                    {entry.location && <span className="timeline-block__location">{entry.location}</span>}
                  </div>

                  <h3 className="timeline-block__role">{entry.role}</h3>
                  <div className="timeline-block__org">
                    {entry.role.includes('Intern') ? (
                      <Briefcase size={14} />
                    ) : entry.role.includes('Postgraduate') ? (
                      <GraduationCap size={14} />
                    ) : (
                      <Radio size={14} />
                    )}
                    <span>{entry.organization}</span>
                  </div>

                  <p className="timeline-block__summary">{entry.summary}</p>

                  {/* Dedicated Internship Project Showcases */}
                  {entry.internshipProjects && (
                    <div className="internship-projects-grid">
                      {entry.internshipProjects.map((proj) => {
                        const isVDart = proj.id === 'vdart-academy'
                        const isVBooking = proj.id === 'vbooking'
                        const previewClass = isVDart
                          ? 'screen-preview--vdart'
                          : isVBooking
                          ? 'screen-preview--vbooking'
                          : 'screen-preview--vnav'
                        const pillClass = isVDart
                          ? 'label-pill--redesign'
                          : isVBooking
                          ? 'label-pill--booking'
                          : 'label-pill--scratch'
                        return (
                          <div key={proj.id} className="internship-project-subcard" data-cursor="view">
                            {/* Browser Mockup Preview */}
                            <div className="subcard-mockup-header">
                              <div className="browser-mockup__bar" style={{ padding: '0.45rem 0.8rem' }}>
                                <div className="browser-mockup__dots">
                                  <span className="b-dot b-dot--red" />
                                  <span className="b-dot b-dot--yellow" />
                                  <span className="b-dot b-dot--green" />
                                </div>
                                <div className="browser-mockup__address" style={{ fontSize: '0.48rem' }}>
                                  <Lock size={10} className="lock-icon" />
                                  <span>{proj.url.replace('https://', '')}</span>
                                </div>
                                {proj.iconUrl && (
                                  <div className="browser-mockup__site-icon">
                                    <img src={proj.iconUrl} alt="" style={{ width: '16px', height: '16px' }} />
                                  </div>
                                )}
                              </div>
                              <div
                                className={`screen-preview ${previewClass}`}
                                style={{ height: '70px', padding: '0.5rem 0.8rem' }}
                              >
                                {isVBooking ? (
                                  <div className="mock-booking-layout" style={{ gap: '0.35rem' }}>
                                    <div className="mock-booking-searchbar" style={{ padding: '0.2rem 0.4rem' }}>
                                      <span className="mock-booking-input" style={{ width: '45%', height: '5px' }} />
                                      <span className="mock-booking-date" style={{ width: '22%', height: '5px' }} />
                                      <span className="mock-btn-pill mock-btn-pill--booking" style={{ width: '14px', height: '5px' }} />
                                    </div>
                                    <div className="mock-booking-slots" style={{ gap: '0.3rem' }}>
                                      <div className="mock-booking-slot mock-booking-slot--active" style={{ height: '18px' }} />
                                      <div className="mock-booking-slot" style={{ height: '18px' }} />
                                      <div className="mock-booking-slot" style={{ height: '18px' }} />
                                      <div className="mock-booking-slot" style={{ height: '18px' }} />
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="mock-headline" style={{ width: '50%', height: '7px' }} />
                                    <div className="mock-subline" style={{ width: '35%', height: '4px' }} />
                                    <div className="mock-cards-row">
                                      <div className="mock-card" style={{ height: '24px' }} />
                                      <div className="mock-card" style={{ height: '24px' }} />
                                      <div className="mock-card" style={{ height: '24px' }} />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="internship-project-subcard__top">
                              <span
                                className={`contribution-card__label-pill ${pillClass}`}
                              >
                                <Sparkles size={11} />
                                <span>{proj.badgeLabel}</span>
                              </span>
                              <span className="internship-project-subcard__category">{proj.category}</span>
                            </div>

                            <div className="internship-project-subcard__title-row">
                              <h4 className="internship-project-subcard__title">{proj.title}</h4>
                              <span className="internship-project-subcard__role">{proj.role}</span>
                            </div>

                            <p className="internship-project-subcard__overview">
                              {proj.description}
                            </p>

                            <div className="internship-project-subcard__contributions">
                              <span className="subcard-section-label">Specific Contributions:</span>
                              <ul className="internship-project-subcard__list">
                                {proj.contributionPoints.map((pt) => (
                                  <li key={pt}>
                                    <CheckCircle2 size={13} className="contribution-check-icon" />
                                    <span>{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="internship-project-subcard__tech">
                              <span className="tech-label">Technologies Used:</span>
                              <div className="tag-list">
                                {proj.technologies.map((t) => (
                                  <span key={t} className={t.includes('[') ? 'tag--placeholder' : ''}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <a
                              href={proj.url}
                              target="_blank"
                              rel="noreferrer"
                              className="button button--solid button--sm internship-project-subcard__cta"
                              data-cursor="open"
                            >
                              <span>Visit Live Website</span>
                              <ExternalLink size={13} />
                            </a>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* External links */}
                  {entry.links && (
                    <div className="timeline-block__links">
                      <span className="links-title">Contributed Platforms:</span>
                      <div className="timeline-block__links-list">
                        {entry.links.map((link) => (
                          <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="timeline-link-pill"
                            data-cursor="open"
                          >
                            <span>{link.label}</span>
                            <ExternalLink size={12} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.technologies && (
                    <div className="tag-list timeline-block__tags">
                      {entry.technologies.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ========================================================
            SECTION 6: APPROACH / WORKING PROCESS (Interactive Timeline)
           ======================================================== */}
        <section className="approach-section" id="approach" aria-labelledby="approach-title">
          <div className="section-pad approach-section__inner">
            <motion.div
              className="approach-section__intro"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={reveal}
            >
              <SectionLabel number="06">Working Process</SectionLabel>
              <h2 id="approach-title">
                Thoughtful by
                <br />
                <em>default.</em>
              </h2>
              <p>
                An interactive walk through my engineering workflow: understanding user intent, structuring reliable
                schemas, building responsive interfaces, and refining code until it is dependable and maintainable.
              </p>
            </motion.div>

            {/* Interactive Stepper with Animated Progress Line */}
            <InteractiveApproach />
          </div>
        </section>

        {/* ========================================================
            SECTION 7: ABOUT SECTION
           ======================================================== */}
        <section className="section-pad about-section" id="about" aria-labelledby="about-title">
          <motion.div
            className="about-section__left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={reveal}
          >
            <SectionLabel number="07">Context & Philosophy</SectionLabel>
            <h2 id="about-title">
              The person
              <br />
              behind the <em>code.</em>
            </h2>

            <p className="about-section__lede">
              I’m a computer science postgraduate interested in building practical software that solves real problems.
            </p>

            <p>
              My work spans full-stack web development, Python applications, and AI-powered tools. I enjoy working
              across the frontend and backend—from designing clear interfaces to building APIs, connecting
              databases, and improving application workflows.
            </p>

            <p>
              I have also contributed to live websites, giving me the opportunity to work with real-world
              requirements and development tasks.
            </p>

            <p>
              I’m continuously improving my engineering skills through practical projects, documentation, and
              hands-on development.
            </p>

            <div className="about-section__social-links">
              <a
                className="text-link"
                href="https://linkedin.com/in/hariprasath-nagarajan"
                target="_blank"
                rel="noreferrer"
                data-cursor="linkedin"
              >
                LinkedIn Profile <ArrowUpRight size={15} />
              </a>
              <a
                className="text-link"
                href="https://github.com/Hariprasathnagarajan"
                target="_blank"
                rel="noreferrer"
                data-cursor="github"
              >
                GitHub Profile <ArrowUpRight size={15} />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="about-section__right"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={reveal}
          >
            <div className="about-pillars">
              <div className="about-pillar-card" data-cursor="card">
                <div className="about-pillar-card__icon">
                  <Code2 size={20} />
                </div>
                <h4>Pragmatic Engineering</h4>
                <p>
                  Focused on solving concrete user pain points rather than adding unnecessary complexity. Clean,
                  maintainable code beats hype every time.
                </p>
              </div>

              <div className="about-pillar-card" data-cursor="card">
                <div className="about-pillar-card__icon">
                  <Layers size={20} />
                </div>
                <h4>End-to-End Ownership</h4>
                <p>
                  Equally comfortable shaping responsive frontend components, building REST API endpoints, and
                  querying relational databases.
                </p>
              </div>

              <div className="about-pillar-card" data-cursor="card">
                <div className="about-pillar-card__icon">
                  <Cpu size={20} />
                </div>
                <h4>Applied AI Systems</h4>
                <p>
                  Working with RAG, vector retrieval, and prompt architectures to build grounded tools that provide
                  verifiable answers.
                </p>
              </div>
            </div>

            <div className="quote-card">
              <span>“</span>
              <p>Give me a messy problem and a little room to think.</p>
              <small>— Hariprasath Nagarajan</small>
            </div>
          </motion.div>
        </section>

        {/* ========================================================
            SECTION 8: CONTACT SECTION
           ======================================================== */}
        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="section-pad contact-section__inner">
            <motion.div
              className="contact-section__info"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={reveal}
            >
              <SectionLabel number="08">Get in Touch</SectionLabel>
              <h2 id="contact-title">
                Have a project or
                <br />
                <em>opportunity in mind?</em>
              </h2>
              <p>
                I’m open to full-stack development, Python development, and AI application development
                opportunities. Whether you have an open role, an interesting project, or simply want to connect, I’d
                be glad to hear from you.
              </p>

              {/* Animated Connection Pulse Bar */}
              <div className="contact-signal-indicator">
                <span className="signal-dot" />
                <span className="signal-line" />
                <span className="signal-text">Ready for live inquiries · Fast response</span>
              </div>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <Mail size={18} />
                  <div>
                    <span className="info-label">Direct Email</span>
                    <a
                      href="mailto:hariprasathnagarajan24@gmail.com"
                      className="info-val info-val--link"
                      data-cursor="mail"
                    >
                      hariprasathnagarajan24@gmail.com
                    </a>
                  </div>
                </div>

                <div className="contact-info-item">
                  <MapPin size={18} />
                  <div>
                    <span className="info-label">Location</span>
                    <span className="info-val">Trichy, Tamil Nadu, India</span>
                  </div>
                </div>
              </div>

              <div className="contact-actions">
                <a
                  className="button button--light"
                  href="mailto:hariprasathnagarajan24@gmail.com"
                  data-cursor="mail"
                >
                  Email Me Directly <Mail size={16} />
                </a>
                <button
                  type="button"
                  className="button button--outline"
                  onClick={copyEmail}
                  aria-label="Copy email address to clipboard"
                  data-cursor="copy"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>

              <div className="contact-socials-row">
                <span className="socials-label">Profiles:</span>
                <a
                  href="https://github.com/Hariprasathnagarajan"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub Profile"
                  className="social-circle"
                  data-cursor="github"
                >
                  <Github size={18} />
                </a>
                <a
                  href="https://linkedin.com/in/hariprasath-nagarajan"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn Profile"
                  className="social-circle"
                  data-cursor="linkedin"
                >
                  <Linkedin size={18} />
                </a>
              </div>
            </motion.div>

            {/* Interactive Contact Form */}
            <motion.div
              className="contact-section__form-wrap"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={reveal}
            >
              <div className="contact-form-card">
                <div className="contact-form-card__header">
                  <h3>Send a Direct Message</h3>
                  <p>Fill out the form and I will respond to your message promptly.</p>
                </div>

                {formSubmitted ? (
                  <div className="contact-form-card__success">
                    <Sparkles size={40} className="success-icon" />
                    <h4>Message Draft Prepared</h4>
                    <p>
                      Thank you for reaching out, <strong>{formData.name}</strong>! Your inquiry regarding{' '}
                      <strong>{formData.subject}</strong> has been formatted.
                    </p>
                    <p className="success-sub">
                      Click below to dispatch via your default email client:
                    </p>
                    <a
                      href={`mailto:hariprasathnagarajan24@gmail.com?subject=${encodeURIComponent(
                        `[Portfolio] ${formData.subject} from ${formData.name}`
                      )}&body=${encodeURIComponent(
                        `Hi Hariprasath,\n\nName: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`
                      )}`}
                      className="button button--solid"
                      data-cursor="mail"
                    >
                      Open Email App with Draft <Send size={15} />
                    </a>
                    <button
                      type="button"
                      className="button button--outline reset-btn"
                      onClick={() => {
                        setFormSubmitted(false)
                        setFormData({
                          name: '',
                          email: '',
                          subject: 'Full-Stack Opportunity',
                          message: '',
                        })
                      }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} noValidate className="contact-form">
                    <div className="form-group">
                      <label htmlFor={nameInputId}>
                        Your Name <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        id={nameInputId}
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          if (formErrors.name) setFormErrors({ ...formErrors, name: '' })
                        }}
                        placeholder="e.g. Alex Morgan"
                        className={formErrors.name ? 'input--error' : ''}
                      />
                      {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor={emailInputId}>
                        Your Email <span className="req">*</span>
                      </label>
                      <input
                        type="email"
                        id={emailInputId}
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value })
                          if (formErrors.email) setFormErrors({ ...formErrors, email: '' })
                        }}
                        placeholder="e.g. alex@example.com"
                        className={formErrors.email ? 'input--error' : ''}
                      />
                      {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor={subjectInputId}>Topic / Role</label>
                      <select
                        id={subjectInputId}
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      >
                        <option value="Full-Stack Opportunity">Full-Stack Development Role</option>
                        <option value="Python Development Role">Python Development Role</option>
                        <option value="AI Application Development">AI Application Development</option>
                        <option value="Freelance / Contract Project">Freelance / Project Inquiry</option>
                        <option value="General Conversation">General Conversation / Networking</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor={messageInputId}>
                        Message <span className="req">*</span>
                      </label>
                      <textarea
                        id={messageInputId}
                        rows={4}
                        value={formData.message}
                        onChange={(e) => {
                          setFormData({ ...formData, message: e.target.value })
                          if (formErrors.message) setFormErrors({ ...formErrors, message: '' })
                        }}
                        placeholder="Tell me about the role, project, or what you'd like to collaborate on..."
                        className={formErrors.message ? 'input--error' : ''}
                      />
                      {formErrors.message && <span className="field-error">{formErrors.message}</span>}
                    </div>

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="button button--solid form-submit-btn"
                      data-cursor="submit"
                    >
                      {formSubmitting ? (
                        <span>Preparing Draft...</span>
                      ) : (
                        <>
                          <span>Submit &amp; Compose Draft</span>
                          <Send size={15} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer section-pad">
        <div className="footer__brand">
          <a className="wordmark" href="#top" aria-label="Hariprasath Nagarajan home" data-cursor="top">
            <span>HN</span>
            <i>/</i>
          </a>
          <span className="footer__tagline">
            Full-Stack Developer · Python &amp; AI Application Development
          </span>
        </div>

        <div className="footer__center">
          <span>&copy; {new Date().getFullYear()} Hariprasath Nagarajan. Built with intent.</span>
        </div>

        <div className="footer__links">
          {/* Terminal Easter Egg Pill */}
          <button
            type="button"
            className="terminal-pill-btn"
            onClick={() => setTerminalOpen(true)}
            title="Open Developer Console (Ctrl+Shift+K)"
            data-cursor="terminal"
          >
            <Terminal size={12} />
            <span>Console</span>
            <kbd>Ctrl+Shift+K</kbd>
          </button>

          <a href="https://github.com/Hariprasathnagarajan" target="_blank" rel="noreferrer" data-cursor="github">
            GitHub
          </a>
          <span>·</span>
          <a href="https://linkedin.com/in/hariprasath-nagarajan" target="_blank" rel="noreferrer" data-cursor="linkedin">
            LinkedIn
          </a>
          <span>·</span>
          <a href="#top" className="footer__back-top" data-cursor="top">
            Back to top <ArrowUpRight size={14} />
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
