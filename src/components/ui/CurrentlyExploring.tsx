import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../../hooks'
import { currentlyExploring } from '../../data/skills'
import { ArrowRight } from 'lucide-react'

export function CurrentlyExploring() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref)

  return (
    <section ref={ref} className="relative border-b-3 border-black bg-black text-white overflow-hidden">
      <div className="p-8 md:p-12 border-b-2 border-white/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <span className="w-2 h-2 bg-accent-lime animate-pulse" />
          <h2 className="font-display text-2xl md:text-3xl tracking-tight">
            CURRENTLY EXPLORING
          </h2>
        </motion.div>
      </div>

      <div className="overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex animate-marquee"
        >
          {[...currentlyExploring, ...currentlyExploring].map((item, i) => (
            <div
              key={`${item}-${i}`}
              className="flex items-center gap-4 shrink-0 px-8 py-6 border-r border-white/10"
            >
              <ArrowRight size={14} className="text-accent-lime" />
              <span className="font-mono text-sm tracking-wider whitespace-nowrap">
                {item.toUpperCase()}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
