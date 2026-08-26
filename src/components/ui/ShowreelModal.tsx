import { motion } from 'framer-motion'
import { X, Play } from 'lucide-react'
import { projects } from '../../data/projects'

interface ShowreelModalProps {
  onClose: () => void
}

export function ShowreelModal({ onClose }: ShowreelModalProps) {
  const featuredProjects = projects.filter((p) => p.featured)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto bg-bg-card border-3 border-black"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white border-2 border-black hover:bg-accent-lime transition-colors duration-150"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="relative aspect-video bg-black border-b-3 border-black flex items-center justify-center">
          <div className="text-center p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-accent-lime text-accent-lime font-mono text-xs tracking-wider mb-6">
              <Play size={12} />
              AI SHOWREEL
            </div>
            <h3 className="font-display text-2xl md:text-3xl tracking-tight mb-3">
              BUILDING THE FUTURE<br />WITH AI
            </h3>
            <p className="text-sm text-text-muted max-w-lg mx-auto">
              A showcase of AI-powered applications, LLM integrations, RAG systems, and full-stack development projects.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 text-text-muted text-xs font-mono">
              <span className="w-2 h-2 bg-accent-lime animate-pulse" />
              DEMO VIDEO COMING SOON
            </div>
          </div>
        </div>

        <div className="p-6 border-b-3 border-black">
          <h4 className="font-mono text-[10px] text-text-muted tracking-[0.3em] uppercase mb-4">
            FEATURED PROJECTS
          </h4>
          <div className="grid sm:grid-cols-2 gap-0 border-2 border-black divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-black">
            {featuredProjects.map((project) => (
              <button
                key={project.id}
                onClick={onClose}
                className="flex items-center gap-4 p-4 hover:bg-black hover:text-white transition-all duration-150 text-left group"
              >
                <div className="w-10 h-10 bg-accent-lime flex items-center justify-center shrink-0 group-hover:bg-white">
                  <span className="text-black font-display text-sm">{project.title.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium tracking-tight group-hover:text-accent-lime transition-colors truncate">
                    {project.title}
                  </p>
                  <p className="text-[10px] font-mono text-text-muted group-hover:text-white/40 transition-colors">
                    {project.year} · {project.technologies.slice(0, 3).join(', ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
