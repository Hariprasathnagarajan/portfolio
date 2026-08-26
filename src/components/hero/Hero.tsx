import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { ArrowDown, Play } from 'lucide-react'
import { profile } from '../../data/profile'

function ParticleField() {
  const ref = useRef<THREE.Points>(null!)
  const count = 1500

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
      ref.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#C8FF00"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <ParticleField />
    </>
  )
}

interface HeroProps {
  onShowReel: () => void
}

export function Hero({ onShowReel }: HeroProps) {
  return (
    <div className="relative min-h-screen border-b-3 border-black overflow-hidden">
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 15], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Scene />
        </Canvas>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 border-b-3 border-black">
          <div className="hidden lg:flex flex-col justify-between p-8 border-r-3 border-black w-16">
            <span className="font-mono text-[10px] text-text-muted tracking-wider [writing-mode:vertical-lr] rotate-180">
              SYS.2026
            </span>
            <span className="font-mono text-[10px] text-text-muted tracking-wider [writing-mode:vertical-lr] rotate-180">
              NODE_01
            </span>
          </div>

          <div className="lg:col-span-11 flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="w-2 h-2 bg-green-500 animate-pulse" />
              <span className="font-mono text-[11px] text-text-muted tracking-wider uppercase">
                {profile.availabilityText}
              </span>
            </motion.div>

            <div className="max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7rem] leading-[0.9] tracking-tight mb-8"
              >
                <span className="block text-text-primary">BUILDING</span>
                <span className="block text-text-primary ml-0 sm:ml-12 md:ml-24">INTELLIGENT</span>
                <span className="block text-accent-lime ml-0 sm:ml-24 md:ml-48">SYSTEMS.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="font-mono text-xs md:text-sm text-text-secondary tracking-wider mb-12 max-w-xl"
              >
                {profile.title} / GENERATIVE AI / FULL STACK
              </motion.p>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-sm md:text-base text-text-tertiary max-w-2xl mb-12 leading-relaxed"
            >
              {profile.bio}
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 border-b-3 border-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="border-b-3 md:border-b-0 md:border-r-3 border-black"
          >
            <button
              onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full group flex items-center justify-between p-6 md:p-8 bg-black text-accent-lime hover:bg-accent-lime hover:text-black transition-all duration-150"
            >
              <span className="font-display text-lg md:text-xl tracking-tight">EXPLORE WORK</span>
              <span className="font-mono text-sm transition-transform duration-150 group-hover:translate-x-2">→</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <button
              onClick={onShowReel}
              className="w-full group flex items-center justify-between p-6 md:p-8 bg-bg-card hover:bg-bg-tertiary transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                <Play size={16} />
                <span className="font-display text-lg md:text-xl tracking-tight">VIEW SHOWREEL</span>
              </div>
              <span className="font-mono text-[10px] text-text-muted tracking-wider">SYS.02</span>
            </button>
          </motion.div>
        </div>

        <div className="hidden md:flex items-center justify-between px-8 py-3 font-mono text-[10px] text-text-muted tracking-wider bg-bg-secondary/50">
          <span>STATUS: AVAILABLE</span>
          <span>LOCATION: TRICHY, INDIA</span>
          <button
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 hover:text-accent-lime transition-colors duration-150"
          >
            <ArrowDown size={12} />
            SCROLL
          </button>
        </div>
      </div>
    </div>
  )
}
