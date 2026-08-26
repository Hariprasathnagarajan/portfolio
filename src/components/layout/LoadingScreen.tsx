import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps {
  onComplete: () => void
}

const loadingSteps = [
  { text: 'INITIALIZING_PORTFOLIO...', progress: 0 },
  { text: 'LOADING_AI_SYSTEMS...', progress: 25 },
  { text: 'CONNECTING_PROJECT_DATA...', progress: 50 },
  { text: 'RENDERING_INTERFACE...', progress: 75 },
  { text: 'BUILD_COMPLETE', progress: 100 },
]

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    const step = loadingSteps[currentStep]
    if (!step) return

    let charIndex = 0
    setTypedText('')
    const typeInterval = setInterval(() => {
      if (charIndex < step.text.length) {
        setTypedText(step.text.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typeInterval)
      }
    }, 25)

    return () => clearInterval(typeInterval)
  }, [currentStep])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(interval)
          setTimeout(() => {
            setIsExiting(true)
            setTimeout(onComplete, 400)
          }, 600)
          return prev
        }
        return prev + 1
      })
    }, 450)

    return () => clearInterval(interval)
  }, [onComplete])

  const step = loadingSteps[currentStep]
  const barWidth = `${step.progress}%`

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px bg-accent-lime/10"
                style={{
                  left: `${(i + 1) * (100 / 13)}%`,
                  height: '100%',
                }}
              />
            ))}
            {[...Array(6)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute h-px bg-accent-lime/10"
                style={{
                  top: `${(i + 1) * (100 / 7)}%`,
                  width: '100%',
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col items-center gap-8 w-80"
          >
            <div className="font-mono text-[10px] tracking-[0.4em] text-accent-lime/60 uppercase">
              HARIPRASATH NAGARAJAN
            </div>

            <div className="w-full space-y-4">
              <div className="font-mono text-sm text-accent-lime h-5">
                {typedText}<span className="animate-pulse">_</span>
              </div>

              <div className="h-[3px] w-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-accent-lime"
                  animate={{ width: barWidth }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>

              <div className="flex justify-between font-mono text-[10px] text-white/40">
                <span>PROGRESS</span>
                <span className="text-accent-lime">{step.progress}%</span>
              </div>
            </div>

            <div className="flex gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-accent-lime"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
