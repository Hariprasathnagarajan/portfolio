import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../../hooks'
import { certifications } from '../../data/skills'

export function Certifications() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref)

  return (
    <section ref={ref} className="relative">
      <div className="p-8 md:p-12 border-b-3 border-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="font-mono text-[10px] text-text-muted tracking-[0.3em] uppercase mb-4">
            [ 07 / CERTS ]
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-tight">
            <span className="block">CERTIFICA</span>
            <span className="block">TIONS.</span>
          </h2>
        </motion.div>
      </div>

      <div className="divide-y-2 divide-black">
        {certifications.map((cert, i) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
            className="group hover:bg-black hover:text-white transition-all duration-150"
          >
            <div className="grid grid-cols-1 md:grid-cols-12">
              <div className="md:col-span-1 p-4 md:p-6 border-b-2 md:border-b-0 md:border-r-2 border-black group-hover:border-white/20 transition-colors flex items-start">
                <span className="font-mono text-[10px] text-text-muted tracking-wider group-hover:text-white/40 transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="md:col-span-8 p-4 md:p-6 border-b-2 md:border-b-0 md:border-r-2 border-black group-hover:border-white/20 transition-colors">
                <h3 className="font-display text-base md:text-lg tracking-tight group-hover:text-accent-lime transition-colors">
                  {cert.title.toUpperCase()}
                </h3>
                <p className="text-xs text-text-muted font-mono mt-1 group-hover:text-white/50 transition-colors">
                  {cert.organization}
                </p>
              </div>

              <div className="md:col-span-3 p-4 md:p-6 flex items-center">
                <span className="font-mono text-xs text-text-muted tracking-wider group-hover:text-white/50 transition-colors">
                  {cert.year}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
