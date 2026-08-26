import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from '../../hooks'
import { projects, projectCategories } from '../../data/projects'
import { cn } from '../../lib/utils'
import { ExternalLink } from 'lucide-react'
import { Github } from '../../lib/icons'
import type { ProjectCategory, Project } from '../../types'

export function Projects() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref)
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>('all')

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.category.includes(activeFilter))

  return (
    <section ref={ref} className="relative border-b-3 border-black">
      <div className="p-8 md:p-12 border-b-3 border-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="font-mono text-[10px] text-text-muted tracking-[0.3em] uppercase mb-4">
            [ 04 / WORK ]
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-tight">
              <span className="block">SELECTED</span>
              <span className="block">WORK.</span>
            </h2>
            <span className="font-mono text-xs text-text-muted">
              {filteredProjects.length} PROJECTS
            </span>
          </div>
        </motion.div>
      </div>

      <div className="p-4 md:p-8 border-b-3 border-black bg-bg-secondary/30 overflow-x-auto scrollbar-hide">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-0 min-w-max"
        >
          {projectCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={cn(
                'px-4 py-2.5 text-xs font-mono tracking-wider border-2 border-black transition-all duration-150 whitespace-nowrap -ml-[2px] first:ml-0',
                activeFilter === cat.id
                  ? 'bg-black text-accent-lime z-10'
                  : 'bg-bg-card text-text-primary hover:bg-bg-tertiary'
              )}
            >
              {cat.label.toUpperCase()}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="divide-y-2 divide-black">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, i) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <ProjectRow project={project} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProjects.length === 0 && (
        <div className="p-16 text-center">
          <p className="font-mono text-sm text-text-muted">NO PROJECTS IN THIS CATEGORY.</p>
        </div>
      )}
    </section>
  )
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'group relative border-black transition-all duration-150',
        isHovered ? 'bg-black text-white' : 'bg-bg-card'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-1 flex items-start justify-between md:justify-center p-4 md:p-6 border-b-2 md:border-b-0 md:border-r-2 border-black md:border-current">
          <span className="font-mono text-[10px] tracking-wider text-text-muted group-hover:text-white/40 transition-colors">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="font-mono text-[10px] tracking-wider text-text-muted group-hover:text-white/40 transition-colors md:hidden">
            {project.year}
          </span>
        </div>

        <div className="md:col-span-5 p-4 md:p-6 md:pr-0">
          <div className="flex items-start justify-between md:block">
            <div>
              <h3 className="font-display text-xl md:text-2xl tracking-tight leading-tight mb-2 group-hover:text-accent-lime transition-colors duration-150">
                {project.title.toUpperCase()}
              </h3>
              <p className="text-xs md:text-sm text-text-secondary group-hover:text-white/60 transition-colors leading-relaxed mb-3 line-clamp-2">
                {project.shortDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono tracking-wider border transition-colors',
                  isHovered
                    ? 'border-white/20 text-white/50'
                    : 'border-border text-text-muted'
                )}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden md:flex md:col-span-3 items-center p-6 border-l-2 border-black border-r-2 border-current">
          <div className="space-y-1.5">
            {project.category.filter(c => c !== 'all').slice(0, 3).map((cat) => (
              <div key={cat} className="font-mono text-[10px] text-text-muted group-hover:text-white/40 tracking-wider uppercase">
                {cat.replace('-', ' ')}
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 flex items-center justify-between p-4 md:p-6 border-t-2 md:border-t-0 border-black md:border-l-2 border-current">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-muted group-hover:text-white/50 tracking-wider hidden md:block">
              {project.year}
            </span>
            {project.featured && (
              <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider bg-accent-lime text-black font-bold">
                FEATURED
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'p-2 border-2 transition-all duration-150',
                  isHovered
                    ? 'border-white/20 text-white hover:bg-accent-lime hover:text-black hover:border-accent-lime'
                    : 'border-border text-text-muted hover:border-black hover:text-black'
                )}
                aria-label="View on GitHub"
                onClick={(e) => e.stopPropagation()}
              >
                <Github size={14} />
              </a>
            )}
            <button
              className={cn(
                'p-2 border-2 transition-all duration-150',
                isHovered
                  ? 'border-white/20 text-white hover:bg-accent-lime hover:text-black hover:border-accent-lime'
                  : 'border-border text-text-muted hover:border-black hover:text-black'
              )}
              aria-label="View details"
            >
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'absolute left-0 bottom-0 h-[3px] bg-accent-lime transition-all duration-300',
          isHovered ? 'w-full' : 'w-0'
        )}
      />
    </div>
  )
}
