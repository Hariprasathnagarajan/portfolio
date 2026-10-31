export interface Contribution {
  id: string
  title: string
  subtitle: string
  url: string
  role: string
  category: string
  description: string
  contributionPoints: string[]
  badgeLabel: string
  technologies: string[]
  iconUrl?: string
  accentColor?: string
}

export interface FeaturedProject {
  number: string
  year: string
  title: string
  category: string
  description: string
  problemSolved: string
  keyFeatures: string[]
  stack: string[]
  githubUrl: string
  liveUrl?: string
  statusLabel: string
  accent: 'amber' | 'blue' | 'coral' | 'violet'
}

export interface OpenSourceProject {
  id: string
  number: string
  title: string
  category: string
  purpose: string
  stack: string[]
  keyFeatures: string[]
  status: string
  githubUrl: string
  isRecommendedFirst?: boolean
}

export interface SkillGroup {
  category: string
  description: string
  skills: string[]
}

export interface TimelineEntry {
  period: string
  role: string
  organization: string
  location?: string
  summary: string
  internshipNarrative?: string
  internshipProjects?: Contribution[]
  links?: { label: string; url: string }[]
  technologies?: string[]
}

export interface WorkStep {
  number: string
  title: string
  description: string
}
