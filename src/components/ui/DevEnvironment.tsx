import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../../hooks'
import { devEnvironment } from '../../data/skills'
import { Code, GitBranch, Container, Cpu, Send, Palette } from 'lucide-react'
import { cn } from '../../lib/utils'

const iconMap: Record<string, React.ReactNode> = {
  code: <Code size={20} />,
  'git-branch': <GitBranch size={20} />,
  container: <Container size={20} />,
  cpu: <Cpu size={20} />,
  send: <Send size={20} />,
  figma: <Palette size={20} />,
}

export function DevEnvironment() {
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
            [ 07B / WORKSPACE ]
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl leading-[0.9] tracking-tight">
            <span className="block">DEVELOPMENT</span>
            <span className="block">ENVIRONMENT.</span>
          </h2>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x-2 divide-black">
        {devEnvironment.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className={cn(
              'group p-6 border-b-3 border-black text-center hover:bg-black hover:text-white transition-all duration-150 cursor-default'
            )}
          >
            <div className="flex justify-center mb-3 text-text-muted group-hover:text-accent-lime transition-colors duration-150">
              {iconMap[tool.icon]}
            </div>
            <h3 className="font-display text-sm tracking-tight mb-1">
              {tool.name.toUpperCase()}
            </h3>
            <p className="text-[9px] font-mono text-text-muted tracking-wider uppercase group-hover:text-white/40 transition-colors">
              {tool.category.toUpperCase()}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
