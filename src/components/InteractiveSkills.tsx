import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code2,
  Terminal,
  Database,
  Sparkles,
  FolderGit2,
  CheckCircle2,
  Layers,
} from 'lucide-react'

interface SkillCategoryData {
  id: string
  name: string
  icon: typeof Code2
  description: string
  howIUseIt: string
  skills: Array<{ name: string; detail: string }>
}

const skillCategoriesData: SkillCategoryData[] = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    icon: Code2,
    description: 'Building responsive, accessible, and structured user interfaces with modern tooling.',
    howIUseIt:
      'I structure frontend applications with React and TypeScript, focusing on modular components, clean state management, and semantic HTML. I use Tailwind CSS for maintainable design systems and ensure fluid responsiveness across mobile, tablet, and desktop viewports.',
    skills: [
      { name: 'React', detail: 'Component hierarchies, hooks, and lifecycle state' },
      { name: 'TypeScript', detail: 'Strict static typing, interfaces, and API types' },
      { name: 'JavaScript (ES6+)', detail: 'Asynchronous workflows, DOM events, and modules' },
      { name: 'HTML5 & CSS3', detail: 'Semantic layouts, accessible markup, and CSS variables' },
      { name: 'Tailwind CSS', detail: 'Utility design systems, responsive grids, and tokens' },
      { name: 'Responsive Web Design', detail: 'Mobile-first breakpoints, fluid typography, and touch UX' },
      { name: 'Vite', detail: 'Fast development bundling and production tree-shaking' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend Development',
    icon: Terminal,
    description: 'Architecting clean APIs, server logic, authentication, and structured business rules.',
    howIUseIt:
      'I build backend services primarily in Python using Django and Django REST Framework. I design RESTful endpoints, enforce JWT authentication, validate request payloads, and maintain clean separation of concerns between business logic and database models.',
    skills: [
      { name: 'Python', detail: 'Object-oriented patterns, scripts, and service logic' },
      { name: 'Django', detail: 'MVC architecture, ORM migrations, and administrative models' },
      { name: 'Django REST Framework', detail: 'ModelSerializers, ViewSets, and API routing' },
      { name: 'RESTful APIs', detail: 'HTTP status codes, error contracts, and payload parsing' },
      { name: 'JWT Authentication', detail: 'Token issuance, refresh workflows, and protected views' },
      { name: 'FastAPI basics', detail: 'Async endpoint definitions and Pydantic validation' },
    ],
  },
  {
    id: 'database',
    name: 'Databases & Storage',
    icon: Database,
    description: 'Relational data modeling, schema integrity, and query management.',
    howIUseIt:
      'I design normalized relational database schemas with foreign key relationships, indexes, and constraints. I use PostgreSQL for production deployments and SQLite for rapid local prototyping and test suites, querying via Django ORM and raw SQL when needed.',
    skills: [
      { name: 'PostgreSQL', detail: 'Relational schemas, constraints, indexing, and joins' },
      { name: 'SQLite', detail: 'Local embedded storage, prototyping, and test environments' },
      { name: 'Relational Schema Design', detail: 'Normalization, entity relationships, and migrations' },
      { name: 'ORM Query Optimization', detail: 'select_related, prefetch_related, and indexing' },
    ],
  },
  {
    id: 'ai-python',
    name: 'AI & Python Applications',
    icon: Sparkles,
    description: 'Integrating language models, embeddings, and context-grounded retrieval into applications.',
    howIUseIt:
      'I develop practical AI tools using Retrieval-Augmented Generation (RAG) architectures. I chunk documents, generate vector embeddings with FAISS, and ground LLM answers directly in verified source context to prevent hallucinations and provide exact citations.',
    skills: [
      { name: 'LLM Application Development', detail: 'Prompt structuring, chains, and grounded outputs' },
      { name: 'RAG Systems', detail: 'Retrieval pipelines, context injection, and citation tracking' },
      { name: 'Vector Search (FAISS)', detail: 'High-dimensional embedding storage and similarity search' },
      { name: 'Document Processing', detail: 'PDF text extraction, semantic chunking, and metadata tags' },
      { name: 'AI API Integration', detail: 'Connecting to OpenAI, Ollama, and local LLaMA models' },
      { name: 'Streamlit', detail: 'Rapid interactive prototyping for AI research utilities' },
    ],
  },
  {
    id: 'tools',
    name: 'Tools & Workflow',
    icon: FolderGit2,
    description: 'Version control, API testing, debugging, and everyday development workflow.',
    howIUseIt:
      'I maintain organized Git repositories with descriptive commits and feature branches. I test and document API contracts with Postman, debug browser performance with DevTools, and utilize VS Code with linters and TypeScript tooling for clean codebases.',
    skills: [
      { name: 'Git & GitHub', detail: 'Branching strategies, pull requests, and commit hygiene' },
      { name: 'VS Code', detail: 'Configured extensions, linting, debugging, and snippets' },
      { name: 'Postman', detail: 'API endpoint testing, environment variables, and mocking' },
      { name: 'Command Line', detail: 'PowerShell, Bash navigation, and package scripting' },
      { name: 'Browser DevTools', detail: 'Network inspection, console debugging, and responsive mode' },
    ],
  },
]

export function InteractiveSkills() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('frontend')

  const activeCategory =
    skillCategoriesData.find((c) => c.id === activeCategoryId) || skillCategoriesData[0]

  return (
    <div className="interactive-skills">
      {/* Category Selection Tabs */}
      <div className="skills-tabs" role="tablist" aria-label="Skill Categories">
        {skillCategoriesData.map((cat) => {
          const Icon = cat.icon
          const isActive = cat.id === activeCategoryId
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              className={`skills-tab-btn ${isActive ? 'skills-tab-btn--active' : ''}`}
              onClick={() => setActiveCategoryId(cat.id)}
              data-cursor="tab"
            >
              <Icon size={16} className="tab-icon" />
              <span>{cat.name}</span>
              {isActive && (
                <motion.div
                  className="skills-tab-indicator"
                  layoutId="skillsTabIndicator"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Active Category Panel with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory.id}
          className="skills-detail-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header & Application Context */}
          <div className="skills-detail-panel__intro">
            <div className="panel-badge-row">
              <span className="panel-badge">
                <activeCategory.icon size={14} />
                <span>{activeCategory.name}</span>
              </span>
              <span className="skills-count">{activeCategory.skills.length} core technologies</span>
            </div>

            <p className="skills-panel-overview">{activeCategory.description}</p>

            <div className="skills-application-callout">
              <div className="callout-header">
                <Layers size={14} />
                <span>How I apply this in real projects:</span>
              </div>
              <p className="callout-body">{activeCategory.howIUseIt}</p>
            </div>
          </div>

          {/* Grid of Technologies */}
          <div className="skills-cards-grid">
            {activeCategory.skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                className="skill-card-item"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
              >
                <div className="skill-card-item__top">
                  <CheckCircle2 size={15} className="skill-item-icon" />
                  <h4>{skill.name}</h4>
                </div>
                <p className="skill-card-item__detail">{skill.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
