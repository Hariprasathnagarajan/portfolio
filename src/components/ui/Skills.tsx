import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../../hooks'
import { proficiencyLevels } from '../../data/skills'
import { cn } from '../../lib/utils'

const levelTags: Record<string, string> = {
  blue: 'ADVANCED',
  purple: 'STRONG',
  cyan: 'EXPLORING',
}

export function Skills() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref)

  return (
    <section ref={ref} className="relative border-b-3 border-black">
      <div className="p-8 md:p-12 border-b-3 border-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="font-mono text-[10px] text-text-muted tracking-[0.3em] uppercase mb-4">
            [ 06 / PROFICIENCY ]
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-tight">
            <span className="block">TECHNICAL</span>
            <span className="block">PROFICIENCY.</span>
          </h2>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-black">
        {proficiencyLevels.map((level, i) => {
          const tag = levelTags[level.color] || 'SKILL'
          return (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              className="group hover:bg-black hover:text-white transition-all duration-150"
            >
              <div className="p-6 md:p-8 border-b-2 md:border-b-2 border-black group-hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <span className={cn(
                    'px-2 py-0.5 text-[9px] font-mono tracking-wider font-bold',
                    level.color === 'blue' && 'bg-accent-lime text-black',
                    level.color === 'purple' && 'bg-accent-orange text-white',
                    level.color === 'cyan' && 'bg-black text-accent-lime border border-accent-lime',
                  )}>
                    {tag}
                  </span>
                </div>
                <h3 className="font-display text-xl tracking-tight mb-1">
                  {level.level}
                </h3>
                <p className="text-xs text-text-muted font-mono group-hover:text-white/50 transition-colors">
                  {level.description}
                </p>
              </div>

              <div className="p-6 md:p-8">
                <div className="space-y-1">
                  {level.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-3 py-1.5 hover:pl-2 transition-all duration-150"
                    >
                      <span className="w-1 h-1 bg-text-muted group-hover:bg-accent-lime shrink-0 transition-colors" />
                      <span className="text-sm font-mono tracking-wider group-hover:text-white transition-colors">
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
