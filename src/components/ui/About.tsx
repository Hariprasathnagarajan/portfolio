import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../../hooks'
import { profile } from '../../data/profile'
import { stats } from '../../data/skills'
import { MapPin } from 'lucide-react'

export function About() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref)

  return (
    <section ref={ref} className="relative border-b-3 border-black">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 border-b-3 lg:border-b-0 lg:border-r-3 border-black">
          <div className="sticky top-16 h-full flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="p-8 md:p-12 border-b-3 border-black"
            >
              <div className="font-mono text-[10px] text-text-muted tracking-[0.3em] uppercase mb-4">
                [ 02 / ABOUT ]
              </div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-tight">
                <span className="block">THE</span>
                <span className="block">ENGINEER.</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 md:p-12"
            >
              <div className="relative aspect-[4/5] bg-bg-card border-3 border-black overflow-hidden">
                <img
                  src="/photo.jpeg"
                  alt="Hariprasath Nagarajan"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-accent-lime animate-pulse" />
                    <span className="text-[10px] font-mono text-accent-lime tracking-wider">OPEN TO OPPORTUNITIES</span>
                  </div>
                  <p className="text-[11px] text-white/70 font-mono">
                    {profile.specializations}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-text-muted font-mono">
                <MapPin size={12} />
                {profile.location}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-8 md:p-12 border-b-3 border-black"
          >
            <div className="font-mono text-[10px] text-text-muted tracking-[0.3em] uppercase mb-6">
              BIO / DESCRIPTION
            </div>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              {profile.detailedBio.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-sm md:text-base">{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                className="p-6 md:p-8 border-b-3 border-black text-center hover:bg-black hover:text-white transition-all duration-150 group"
              >
                <div className="font-display text-3xl md:text-4xl tracking-tight mb-2 group-hover:text-accent-lime transition-colors duration-150">
                  {stat.value}
                </div>
                <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider group-hover:text-white/60 transition-colors duration-150 leading-snug">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
