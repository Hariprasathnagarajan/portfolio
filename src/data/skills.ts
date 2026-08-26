import type { SkillCategory } from '../types'

export const skillCategories: SkillCategory[] = [
  {
    category: 'Programming',
    level: 'advanced',
    items: ['Python', 'JavaScript', 'TypeScript', 'SQL'],
  },
  {
    category: 'AI & LLM',
    level: 'advanced',
    items: [
      'Generative AI',
      'Large Language Models',
      'Prompt Engineering',
      'RAG',
      'LangChain',
      'Ollama',
      'LLaMA 2',
      'LLaMA 3',
      'Hugging Face Embeddings',
      'FAISS',
      'Semantic Search',
      'Document Question Answering',
    ],
  },
  {
    category: 'Backend',
    level: 'strong',
    items: ['FastAPI', 'Django', 'Django REST Framework', 'REST APIs', 'JWT Authentication'],
  },
  {
    category: 'Frontend',
    level: 'strong',
    items: ['React.js', 'Next.js', 'Tailwind CSS', 'Streamlit', 'Flutter', 'React Native', 'HTML5', 'CSS3'],
  },
  {
    category: 'Databases',
    level: 'strong',
    items: ['PostgreSQL', 'MongoDB', 'MySQL'],
  },
  {
    category: 'Tools',
    level: 'strong',
    items: ['Git', 'Docker', 'Postman', 'Figma', 'VS Code'],
  },
]

export const proficiencyLevels = [
  {
    level: 'Advanced / Primary Focus',
    description: 'Core technologies and daily-use tools',
    skills: ['Python', 'Generative AI', 'LangChain', 'RAG', 'React', 'FastAPI'],
    color: 'blue',
  },
  {
    level: 'Strong Working Experience',
    description: 'Technologies used in production and projects',
    skills: ['Django', 'Django REST Framework', 'REST APIs', 'JWT', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    color: 'purple',
  },
  {
    level: 'Exploring / Expanding',
    description: 'Actively learning and developing expertise',
    skills: ['Advanced Agentic AI', 'Advanced RAG Architectures', 'AI System Design', 'AI Evaluation', 'LLM Optimization'],
    color: 'cyan',
  },
]

export const developmentJourney = [
  { year: '2020–2023', title: 'B.Sc. Computer Science', institution: 'National College, Trichy', icon: 'graduation' },
  { year: '2023–2025', title: 'M.Sc. Computer Science', institution: 'Bharathidasan University', icon: 'graduation' },
  { year: '2025–Present', title: 'Full Stack Developer Intern', institution: 'VDart Academy', icon: 'briefcase' },
]

export const currentlyExploring = [
  'Advanced Retrieval-Augmented Generation',
  'Agentic AI Systems',
  'LLM Application Architecture',
  'AI Evaluation',
  'Vector Search Optimization',
  'Production AI Systems',
  'Scalable FastAPI Architectures',
]

export const certifications = [
  { id: '1', title: 'Artificial Intelligence and Machine Learning', organization: 'LOM Technologies India Pvt Ltd (Naan Mudhalvan)', year: '2024' },
  { id: '2', title: 'Full Stack Development', organization: 'VDart Academy', year: '2025' },
  { id: '3', title: 'Application Developer', organization: 'PMKVY', year: '2024' },
  { id: '4', title: 'Big Data Analytics', organization: 'NPTEL / SWAYAM', year: '2024' },
  { id: '5', title: 'UI/UX Design', organization: 'iLife Academy', year: '2024' },
]

export const stats = [
  { label: 'Core AI & Development Domains', value: '5+' },
  { label: 'Featured AI Applications', value: '2' },
  { label: 'Production & Full Stack Projects', value: 'Multiple' },
  { label: 'Professional Development', value: '2025 – Present' },
]

export const devEnvironment = [
  { name: 'VS Code', category: 'Primary IDE', icon: 'code' },
  { name: 'Git', category: 'Version Control', icon: 'git-branch' },
  { name: 'Docker', category: 'Containerization', icon: 'container' },
  { name: 'Ollama', category: 'Local LLM Runtime', icon: 'cpu' },
  { name: 'Postman', category: 'API Testing', icon: 'send' },
  { name: 'Figma', category: 'Design Tool', icon: 'figma' },
]
