import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LoadingScreen } from './components/layout/LoadingScreen'
import { Navigation } from './components/layout/Navigation'
import { ScrollProgress } from './components/layout/ScrollProgress'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/hero/Hero'
import { About } from './components/ui/About'
import { Experience } from './components/experience/Experience'
import { Projects } from './components/projects/Projects'
import { TechStack } from './components/ui/TechStack'
import { Skills } from './components/ui/Skills'
import { Certifications } from './components/ui/Certifications'
import { CurrentlyExploring } from './components/ui/CurrentlyExploring'
import { DevEnvironment } from './components/ui/DevEnvironment'
import { Contact } from './components/contact/Contact'
import { ShowreelModal } from './components/ui/ShowreelModal'
import { useActiveSection } from './hooks'

const sectionIds = ['home', 'about', 'experience', 'work', 'tech-stack', 'skills', 'certifications', 'contact']

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [showReel, setShowReel] = useState(false)
  const activeSection = useActiveSection(sectionIds)

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {!isLoading && (
        <>
          <ScrollProgress />
          <Navigation activeSection={activeSection} />

          <main>
            <div id="home">
              <Hero onShowReel={() => setShowReel(true)} />
            </div>
            <div id="about">
              <About />
            </div>
            <div id="experience">
              <Experience />
            </div>
            <div id="work">
              <Projects />
            </div>
            <div id="tech-stack">
              <TechStack />
            </div>
            <div id="skills">
              <Skills />
              <CurrentlyExploring />
            </div>
            <div id="certifications">
              <Certifications />
              <DevEnvironment />
            </div>
            <div id="contact">
              <Contact />
            </div>
          </main>

          <Footer />
        </>
      )}

      <AnimatePresence>
        {showReel && <ShowreelModal onClose={() => setShowReel(false)} />}
      </AnimatePresence>
    </>
  )
}

export default App
