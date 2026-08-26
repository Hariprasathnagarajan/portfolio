import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../../hooks'
import { experiences } from '../../data/experience'
import { Briefcase, GraduationCap, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Experience() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref)

  return (
    <section ref={ref} className="relative border-b-3 border-black">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-4 border-b-3 lg:border-b-0 lg:border-r-3 border-black">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="p-8 md:p-12 lg:sticky lg:top-16"
          >
            <div className="font-mono text-[10px] text-text-muted tracking-[0.3em] uppercase mb-4">
              [ 03 / JOURNEY ]
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-tight mb-6">
              <span className="block">PROFESSIONAL</span>
              <span className="block">JOURNEY.</span>
            </h2>
            <p className="text-sm text-text-muted font-mono">
              {experiences.length} ENTRIES / 2020 — PRESENT
            </p>
          </motion.div>
        </div>

        <div className="lg:col-span-8">
          {experiences.map((exp, i) => (
            <ExperienceCard key={exp.id} exp={exp} index={i} isInView={isInView} isLast={i === experiences.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ExperienceCard({ exp, index, isInView, isLast }: {
  exp: typeof experiences[number]
  index: number
  isInView: boolean
  isLast: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className={cn(
        'border-b-3 border-black group',
        !isLast && 'border-b-3'
      )}
    >
      <div className="p-6 md:p-8 hover:bg-black hover:text-white transition-all duration-150">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          <div className="flex items-center gap-3 md:w-48 shrink-0">
            <div className={cn(
              'p-2 border-2 border-current',
              exp.type === 'work' ? 'text-accent-lime bg-black' : 'text-black bg-bg-tertiary group-hover:bg-white/10 group-hover:text-accent-lime'
            )}>
              {exp.type === 'work' ? <Briefcase size={16} /> : <GraduationCap size={16} />}
            </div>
            <div>
              <span className="font-mono text-[10px] text-text-muted tracking-wider uppercase block group-hover:text-white/50 transition-colors">
                {exp.type === 'work' ? 'WORK' : 'EDUCATION'}
              </span>
              <span className="font-mono text-xs tracking-wider">
                {exp.period}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-display text-xl md:text-2xl tracking-tight mb-1 group-hover:text-accent-lime transition-colors duration-150">
              {exp.title}
            </h3>
            <p className="font-mono text-xs text-text-muted tracking-wider mb-4 group-hover:text-white/50 transition-colors">
              {exp.company}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed group-hover:text-white/70 transition-colors mb-4">
              {exp.description}
            </p>

            {exp.responsibilities.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 font-mono text-[11px] text-text-muted hover:text-accent-lime transition-colors duration-150 mb-4"
              >
                <ChevronDown size={14} className={cn('transition-transform duration-200', isExpanded && 'rotate-180')} />
                {isExpanded ? 'COLLAPSE DETAILS' : 'VIEW RESPONSIBILITIES'}
              </button>
            )}

            {isExpanded && exp.responsibilities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 mb-4 pl-4 border-l-2 border-text-muted/20"
              >
                {exp.responsibilities.map((resp, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-text-tertiary group-hover:text-white/60 transition-colors">
                    <span className="text-accent-lime mt-0.5 shrink-0">—</span>
                    <span>{resp}</span>
                  </div>
                ))}
              </motion.div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {exp.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 text-[10px] font-mono tracking-wider border border-current group-hover:border-white/20 text-text-muted group-hover:text-white/50 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
