export interface Project {
  id: string
  title: string
  slug: string
  year: string
  category: ProjectCategory[]
  technologies: string[]
  role: string[]
  shortDescription: string
  overview: string
  problem: string
  solution: string
  features: string[]
  architectureSteps: string[]
  responsibilities: string[]
  githubUrl?: string
  liveUrl?: string
  demoUrl?: string
  featured: boolean
  gradient: string
}

export type ProjectCategory =
  | 'all'
  | 'generative-ai'
  | 'llm-applications'
  | 'rag-systems'
  | 'full-stack'
  | 'frontend'
  | 'mobile'
  | 'personal'

export interface Experience {
  id: string
  title: string
  company: string
  period: string
  startDate: string
  endDate: string
  description: string
  responsibilities: string[]
  technologies: string[]
  type: 'work' | 'education'
  institution?: string
  degree?: string
}

export interface Certification {
  id: string
  title: string
  organization: string
  year: string
  description?: string
}

export interface SkillCategory {
  category: string
  level: 'advanced' | 'strong' | 'exploring'
  items: string[]
}

export interface SocialLink {
  platform: string
  url: string
  icon: string
}

export interface ProfileData {
  name: string
  title: string
  specializations: string
  location: string
  phone: string
  email: string
  linkedin: string
  github: string
  portfolio: string
  bio: string
  detailedBio: string
  available: boolean
  availabilityText: string
}
