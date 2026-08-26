import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../../hooks'
import { skillCategories } from '../../data/skills'
import { cn } from '../../lib/utils'

const categoryPrefixes: Record<string, string> = {
  Programming: 'LANG',
  'AI & LLM': 'AI_',
  Backend: 'BE_',
  Frontend: 'FE_',
  Databases: 'DB_',
  Tools: 'TOOL',
}

export function TechStack() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref)
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)

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
              [ 05 / STACK ]
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-tight mb-6">
              <span className="block">TECH</span>
              <span className="block">STACK.</span>
            </h2>
            <p className="text-sm text-text-muted">
              Technologies powering intelligent applications and modern software solutions.
            </p>
            <div className="mt-8 font-mono text-[10px] text-text-muted space-y-2">
              <div>CATEGORIES: {skillCategories.length}</div>
              <div>TECHNOLOGIES: {skillCategories.reduce((sum, c) => sum + c.items.length, 0)}</div>
              <div>STATUS: ACTIVE</div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-8 divide-y-2 divide-black">
          {skillCategories.map((cat, catIndex) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: catIndex * 0.08 }}
              className="group"
            >
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-4 p-6 md:border-r-2 border-black bg-bg-secondary/30">
                  <div className="font-mono text-[10px] text-text-muted tracking-wider mb-2">
                    {categoryPrefixes[cat.category] || 'SYS'}
                  </div>
                  <h3 className="font-display text-lg tracking-tight mb-1">
                    {cat.category.toUpperCase()}
                  </h3>
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                    {cat.level}
                  </span>
                </div>

                <div className="md:col-span-8 p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                    {cat.items.map((tech) => (
                      <div
                        key={tech}
                        className={cn(
                          'relative flex items-center gap-2 py-1.5 px-2 transition-all duration-150 cursor-default',
                          hoveredTech === tech ? 'bg-black text-accent-lime' : 'hover:bg-bg-tertiary'
                        )}
                        onMouseEnter={() => setHoveredTech(tech)}
                        onMouseLeave={() => setHoveredTech(null)}
                      >
                        <span className={cn(
                          'w-1 h-1 shrink-0',
                          hoveredTech === tech ? 'bg-accent-lime' : 'bg-text-muted'
                        )} />
                        <span className="font-mono text-xs tracking-wider">
                          {tech}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
