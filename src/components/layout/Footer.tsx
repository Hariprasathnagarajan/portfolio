import { Mail } from 'lucide-react'
import { profile } from '../../data/profile'
import { Github, Linkedin } from '../../lib/icons'

export function Footer() {
  return (
    <footer className="relative bg-black text-white border-t-3 border-black">
      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-4 p-8 md:p-12 border-b-3 md:border-b-0 md:border-r-2 border-white/20">
          <div className="font-display text-3xl tracking-tight mb-2">
            HN<span className="text-accent-orange">.</span>
          </div>
          <p className="text-xs text-white/40 font-mono tracking-wider mb-6">
            AI ENGINEER<br />
            PYTHON DEVELOPER<br />
            GENERATIVE AI
          </p>
          <div className="font-mono text-[10px] text-accent-lime tracking-wider">
            SYSTEM STATUS: ONLINE
          </div>
        </div>

        <div className="md:col-span-4 p-8 md:p-12 border-b-3 md:border-b-0 md:border-r-2 border-white/20">
          <div className="font-mono text-[10px] text-white/30 tracking-[0.3em] uppercase mb-4">
            CONNECT
          </div>
          <div className="space-y-0 divide-y divide-white/10">
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-3 hover:text-accent-lime transition-colors duration-150 group"
            >
              <Github size={16} />
              <span className="font-mono text-xs tracking-wider">GITHUB</span>
              <span className="ml-auto font-mono text-[10px] text-white/30 group-hover:text-accent-lime transition-colors">→</span>
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-3 hover:text-accent-lime transition-colors duration-150 group"
            >
              <Linkedin size={16} />
              <span className="font-mono text-xs tracking-wider">LINKEDIN</span>
              <span className="ml-auto font-mono text-[10px] text-white/30 group-hover:text-accent-lime transition-colors">→</span>
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-3 py-3 hover:text-accent-lime transition-colors duration-150 group"
            >
              <Mail size={16} />
              <span className="font-mono text-xs tracking-wider">EMAIL</span>
              <span className="ml-auto font-mono text-[10px] text-white/30 group-hover:text-accent-lime transition-colors">→</span>
            </a>
          </div>
        </div>

        <div className="md:col-span-4 p-8 md:p-12 flex flex-col justify-between">
          <div>
            <div className="font-mono text-[10px] text-white/30 tracking-[0.3em] uppercase mb-4">
              INFO
            </div>
            <div className="font-mono text-xs text-white/50 space-y-1.5">
              <div>NAME: {profile.name}</div>
              <div>LOCATION: {profile.location}</div>
              <div>BUILD: PROD</div>
              <div>YEAR: 2026</div>
            </div>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-8 flex items-center gap-2 font-mono text-xs text-white/40 hover:text-accent-lime transition-colors duration-150 group"
          >
            ↑ BACK TO TOP
          </button>
        </div>
      </div>

      <div className="border-t-2 border-white/10 px-8 md:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-mono text-[10px] text-white/30 tracking-wider">
          &copy; {new Date().getFullYear()} HARIPRASATH NAGARAJAN
        </p>
        <p className="font-mono text-[10px] text-white/30 tracking-wider">
          BUILT WITH REACT / TAILWIND / AI
        </p>
      </div>
    </footer>
  )
}
