import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useMediaQuery } from '../../hooks'

const navItems = [
  { id: 'home', label: 'HOME', index: '01' },
  { id: 'about', label: 'ABOUT', index: '02' },
  { id: 'experience', label: 'EXPERIENCE', index: '03' },
  { id: 'work', label: 'WORK', index: '04' },
  { id: 'tech-stack', label: 'STACK', index: '05' },
  { id: 'skills', label: 'SKILLS', index: '06' },
  { id: 'certifications', label: 'CERTS', index: '07' },
  { id: 'contact', label: 'CONTACT', index: '08' },
]

interface NavigationProps {
  activeSection: string
}

export function Navigation({ activeSection }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 border-b-3 transition-colors duration-200',
          isScrolled
            ? 'bg-bg-primary border-black'
            : 'bg-bg-primary border-black'
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <button
              onClick={() => scrollTo('home')}
              className="font-display text-xl md:text-2xl tracking-tight hover:text-accent-lime transition-colors duration-150"
            >
              HN<span className="text-accent-orange">.</span>
            </button>

            {!isMobile ? (
              <div className="flex items-center gap-0">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={cn(
                      'relative px-3 py-2 text-xs font-mono tracking-wider transition-all duration-150 border-2 border-transparent',
                      activeSection === item.id
                        ? 'bg-black text-accent-lime border-black'
                        : 'text-text-secondary hover:text-black hover:bg-bg-tertiary'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="relative z-50 p-2 border-2 border-black bg-white hover:bg-accent-lime transition-colors duration-150"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 bg-bg-primary border-l-3 border-black flex flex-col pt-20"
          >
            <div className="flex flex-col">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    'flex items-center gap-4 px-6 py-4 text-left border-b-2 border-black font-mono text-sm tracking-wider transition-all duration-150',
                    activeSection === item.id
                      ? 'bg-black text-accent-lime'
                      : 'bg-bg-primary hover:bg-bg-tertiary text-text-primary'
                  )}
                >
                  <span className="text-[10px] text-text-muted w-6">{item.index}</span>
                  {item.label}
                </motion.button>
              ))}
            </div>

            <div className="mt-auto px-6 py-6 border-t-2 border-black font-mono text-[10px] text-text-muted tracking-wider">
              SYS.2026 — STATUS: ONLINE
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
