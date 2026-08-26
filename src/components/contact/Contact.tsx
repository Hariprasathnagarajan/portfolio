import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../../hooks'
import { profile } from '../../data/profile'
import { Mail, Phone, MapPin, Globe, Send, CheckCircle, Loader2 } from 'lucide-react'
import { Linkedin, Github } from '../../lib/icons'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export function Contact() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref)
  const [formStatus, setFormStatus] = useState<FormStatus>('idle')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('loading')
    setTimeout(() => {
      setFormStatus('success')
      setTimeout(() => setFormStatus('idle'), 3000)
      setFormData({ name: '', email: '', company: '', projectType: '', message: '' })
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <section ref={ref} className="relative bg-black text-white border-b-3 border-black">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 border-b-3 lg:border-b-0 lg:border-r-2 border-white/20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="p-8 md:p-12"
          >
            <div className="font-mono text-[10px] text-white/40 tracking-[0.3em] uppercase mb-4">
              [ 08 / CONTACT ]
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-tight mb-8">
              <span className="block">LET'S BUILD</span>
              <span className="block">SOMETHING</span>
              <span className="block text-accent-lime">INTELLIGENT.</span>
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mb-10">
              I'm interested in opportunities involving AI engineering, Generative AI, LLM applications,
              RAG systems, Python development, and full-stack software engineering.
            </p>

            <div className="space-y-0 border-2 border-white/20">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/10 group"
              >
                <Mail size={16} className="text-accent-lime shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] font-mono text-white/30 tracking-wider uppercase mb-0.5">EMAIL</p>
                  <p className="text-sm truncate">{profile.email}</p>
                </div>
              </a>

              <a
                href={`tel:${profile.phone}`}
                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/10 group"
              >
                <Phone size={16} className="text-accent-orange shrink-0" />
                <div>
                  <p className="text-[9px] font-mono text-white/30 tracking-wider uppercase mb-0.5">PHONE</p>
                  <p className="text-sm">{profile.phone}</p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 border-b border-white/10">
                <MapPin size={16} className="text-white/40 shrink-0" />
                <div>
                  <p className="text-[9px] font-mono text-white/30 tracking-wider uppercase mb-0.5">LOCATION</p>
                  <p className="text-sm">{profile.location}</p>
                </div>
              </div>

              <div className="flex divide-x divide-white/10">
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-4 hover:bg-accent-lime hover:text-black transition-all duration-150 group"
                >
                  <Linkedin size={14} />
                  <span className="text-xs font-mono tracking-wider">LINKEDIN</span>
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-4 hover:bg-accent-lime hover:text-black transition-all duration-150 group"
                >
                  <Github size={14} />
                  <span className="text-xs font-mono tracking-wider">GITHUB</span>
                </a>
                <a
                  href={profile.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-4 hover:bg-accent-lime hover:text-black transition-all duration-150 group"
                >
                  <Globe size={14} />
                  <span className="text-xs font-mono tracking-wider">PORTFOLIO</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 md:p-12"
          >
            <div className="font-mono text-[10px] text-white/40 tracking-[0.3em] uppercase mb-8">
              SEND_MESSAGE
            </div>

            <form onSubmit={handleSubmit} className="space-y-0">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="border-2 border-white/20 p-4">
                  <label className="block text-[9px] font-mono text-white/30 tracking-wider uppercase mb-2">
                    NAME *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 font-mono"
                    placeholder="Your name"
                  />
                </div>
                <div className="border-2 border-white/20 border-l-0 p-4">
                  <label className="block text-[9px] font-mono text-white/30 tracking-wider uppercase mb-2">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 font-mono"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 border-t-2 border-white/20">
                <div className="border-2 border-white/20 border-t-0 p-4">
                  <label className="block text-[9px] font-mono text-white/30 tracking-wider uppercase mb-2">
                    COMPANY
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 font-mono"
                    placeholder="Optional"
                  />
                </div>
                <div className="border-2 border-white/20 border-t-0 border-l-0 p-4">
                  <label className="block text-[9px] font-mono text-white/30 tracking-wider uppercase mb-2">
                    PROJECT TYPE
                  </label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none outline-none text-sm text-white font-mono appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-black">Select type...</option>
                    <option value="ai-engineering" className="bg-black">AI Engineering</option>
                    <option value="llm-app" className="bg-black">LLM Application</option>
                    <option value="rag-system" className="bg-black">RAG System</option>
                    <option value="full-stack" className="bg-black">Full Stack Development</option>
                    <option value="consulting" className="bg-black">Technical Consulting</option>
                    <option value="other" className="bg-black">Other</option>
                  </select>
                </div>
              </div>

              <div className="border-2 border-white/20 border-t-0 p-4">
                <label className="block text-[9px] font-mono text-white/30 tracking-wider uppercase mb-2">
                  MESSAGE *
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 font-mono resize-none"
                  placeholder="Tell me about your project or opportunity..."
                />
              </div>

              <button
                type="submit"
                disabled={formStatus === 'loading'}
                className="w-full flex items-center justify-center gap-3 p-5 bg-accent-lime text-black font-display text-lg tracking-tight hover:bg-white transition-all duration-150 disabled:opacity-50 border-2 border-accent-lime hover:border-white mt-0"
              >
                {formStatus === 'idle' && (
                  <>
                    SEND MESSAGE
                    <Send size={16} />
                  </>
                )}
                {formStatus === 'loading' && (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    SENDING...
                  </>
                )}
                {formStatus === 'success' && (
                  <>
                    <CheckCircle size={16} />
                    MESSAGE SENT
                  </>
                )}
                {formStatus === 'error' && (
                  <span>SOMETHING WENT WRONG. TRY AGAIN.</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
