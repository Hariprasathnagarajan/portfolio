import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Github } from '../lib/icons'
import type { FeaturedProject } from '../types'

interface ProjectTiltCardProps {
  project: FeaturedProject
  index: number
  isExpanded: boolean
  onToggleExpand: (num: string) => void
}

export function ProjectTiltCard({
  project,
  index,
  isExpanded,
  onToggleExpand,
}: ProjectTiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    // Disable 3D tilt on smaller or touch viewports
    if (window.innerWidth < 980) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate normalized rotation (-1 to 1)
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateY = ((x - centerX) / centerX) * 4.5
    const rotateX = -((y - centerY) / centerY) * 4.5

    setTilt({ x: rotateX, y: rotateY })
    setSpotlight({ x, y, opacity: 1 })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
    setSpotlight((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <motion.article
      ref={cardRef}
      className={`project-card project-card--${project.accent} ${
        isExpanded ? 'project-card--expanded' : ''
      } ${isHovered ? 'project-card--hovered' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor="explore"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.08, duration: 0.65 }}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="card-spotlight"
        style={{
          background: `radial-gradient(450px circle at ${spotlight.x}px ${spotlight.y}px, rgba(244, 163, 64, 0.09), transparent 65%)`,
          opacity: spotlight.opacity,
        }}
        aria-hidden="true"
      />

      {/* Floating Hover Badge */}
      <div className={`card-hover-badge ${isHovered ? 'card-hover-badge--visible' : ''}`}>
        <span>Explore Architecture</span>
        <ArrowUpRight size={13} />
      </div>

      <div className="project-card__header">
        <div className="project-card__number">{project.number}</div>
        <div className="project-card__meta">
          <span className="project-card__category">{project.category}</span>
          <span className="project-card__year">{project.year}</span>
        </div>
        <span className="project-card__status">{project.statusLabel}</span>
      </div>

      <div className="project-card__content">
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__description">{project.description}</p>

        {/* Expandable Architecture & Problem Breakdown */}
        {isExpanded && (
          <div className="project-card__details">
            <div className="project-card__section">
              <span className="project-card__section-label">Problem Solved</span>
              <p className="project-card__section-body">{project.problemSolved}</p>
            </div>

            <div className="project-card__section">
              <span className="project-card__section-label">Key Implemented Features</span>
              <ul className="project-card__feature-list">
                {project.keyFeatures.map((feature) => (
                  <li key={feature}>
                    <CheckCircle2 size={15} className="feature-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="project-card__stack-wrap">
          <div className="tag-list">
            {project.stack.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="project-card__actions">
        <button
          type="button"
          className="button button--outline button--sm"
          onClick={() => onToggleExpand(project.number)}
          aria-expanded={isExpanded}
          data-cursor="toggle"
        >
          {isExpanded ? (
            <>
              <span>Less Details</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span>View Problem &amp; Features</span>
              <ChevronDown size={14} />
            </>
          )}
        </button>

        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="button button--solid button--sm"
          aria-label={`View ${project.title} repository on GitHub`}
          data-cursor="code"
        >
          <Github size={15} />
          <span>GitHub Repo</span>
          <ArrowUpRight size={14} />
        </a>
      </div>
    </motion.article>
  )
}
