import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ExternalLink,
  Globe,
  Lock,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react'
import type { Contribution } from '../types'

interface LiveContributionCardProps {
  site: Contribution
  index: number
}

export function LiveContributionCard({ site, index }: LiveContributionCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setSpotlight({ x, y, opacity: 1 })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setSpotlight((prev) => ({ ...prev, opacity: 0 }))
  }

  const isVDart = site.id === 'vdart-academy'
  const isVBooking = site.id === 'vbooking'

  const cardVariant = isVDart
    ? 'contribution-card--vdart'
    : isVBooking
    ? 'contribution-card--vbooking'
    : 'contribution-card--vnavigate'

  const spotlightColor = isVDart
    ? 'rgba(6, 148, 148, 0.14)'
    : isVBooking
    ? 'rgba(16, 185, 129, 0.14)'
    : 'rgba(37, 99, 235, 0.14)'

  const labelPillClass = isVDart
    ? 'label-pill--redesign'
    : isVBooking
    ? 'label-pill--booking'
    : 'label-pill--scratch'

  const screenPreviewClass = isVDart
    ? 'screen-preview--vdart'
    : isVBooking
    ? 'screen-preview--vbooking'
    : 'screen-preview--vnav'

  const previewBadgeText = isVDart
    ? 'Complete Redesign Preview'
    : isVBooking
    ? 'Developed from Scratch · Booking Engine'
    : 'Designed & Developed from Scratch'

  return (
    <motion.article
      ref={cardRef}
      className={`contribution-card ${cardVariant} ${
        isHovered ? 'contribution-card--hovered' : ''
      }`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor="view"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.12, duration: 0.65 }}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="card-spotlight"
        style={{
          background: `radial-gradient(420px circle at ${spotlight.x}px ${spotlight.y}px, ${spotlightColor}, transparent 60%)`,
          opacity: spotlight.opacity,
        }}
        aria-hidden="true"
      />

      {/* Top Status Header with Required Distinct Labels */}
      <div className="contribution-card__header">
        <div className="contribution-header-left">
          <div className="contribution-card__badge-live">
            <span className="live-pulse" />
            <span>LIVE WEBSITE</span>
          </div>

          <div className={`contribution-card__label-pill ${labelPillClass}`}>
            <Sparkles size={12} />
            <span>{site.badgeLabel}</span>
          </div>
        </div>

        <span className="contribution-card__role-tag">{site.role}</span>
      </div>

      {/* Project Category / Type Banner */}
      <div className="contribution-supporting-banner">
        <span>{site.category}</span>
      </div>

      {/* Mock Browser Window with Real Site Icon & UI Preview */}
      <div className="browser-mockup">
        <div className="browser-mockup__bar">
          <div className="browser-mockup__dots">
            <span className="b-dot b-dot--red" />
            <span className="b-dot b-dot--yellow" />
            <span className="b-dot b-dot--green" />
          </div>

          <div className="browser-mockup__address">
            <Lock size={11} className="lock-icon" />
            <span>{site.url.replace('https://', '')}</span>
          </div>

          {site.iconUrl && (
            <div className="browser-mockup__site-icon">
              <img src={site.iconUrl} alt={`${site.title} logo icon`} />
            </div>
          )}
        </div>

        {/* Website UI Preview Canvas */}
        <div className="browser-mockup__screen">
          <div className={`screen-preview ${screenPreviewClass}`}>
            <div className="screen-preview__overlay">
              <span className="screen-preview__badge">
                <Globe size={13} /> {previewBadgeText}
              </span>
            </div>

            {/* Structured Visual Wireframe Mock of the Site */}
            <div className="screen-preview__content">
              <div className="mock-nav">
                <div className="mock-logo-wrap">
                  {site.iconUrl && <img src={site.iconUrl} alt="" className="mock-logo-img" />}
                  <span className="mock-logo">{site.title.toUpperCase()}</span>
                </div>
                <div className="mock-links">
                  <span />
                  <span />
                  <span />
                  <span className={`mock-btn-pill ${isVBooking ? 'mock-btn-pill--booking' : ''}`} />
                </div>
              </div>

              {isVBooking ? (
                <div className="mock-booking-layout">
                  <div className="mock-booking-searchbar">
                    <span className="mock-booking-input" />
                    <span className="mock-booking-date" />
                    <span className="mock-btn-pill mock-btn-pill--booking" />
                  </div>
                  <div className="mock-booking-slots">
                    <div className="mock-booking-slot mock-booking-slot--active" />
                    <div className="mock-booking-slot" />
                    <div className="mock-booking-slot" />
                    <div className="mock-booking-slot" />
                  </div>
                </div>
              ) : (
                <div className="mock-hero-layout">
                  <div className="mock-badge-tag" />
                  <div className="mock-headline" />
                  <div className="mock-subline" />
                  <div className="mock-cards-row">
                    <div className="mock-card mock-card--1" />
                    <div className="mock-card mock-card--2" />
                    <div className="mock-card mock-card--3" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="contribution-card__body">
        <div className="contribution-card__title-row">
          <div>
            <h3>{site.title}</h3>
            <span className="contribution-card__subtitle">{site.subtitle}</span>
          </div>

          <a
            href={site.url}
            target="_blank"
            rel="noreferrer"
            className="contribution-card__url-link"
            aria-label={`Open ${site.title} website in new tab`}
            data-cursor="open"
          >
            <Globe size={15} />
            <span>{site.url.replace('https://', '')}</span>
            <ExternalLink size={13} />
          </a>
        </div>

        <p className="contribution-card__desc">{site.description}</p>

        {/* Confirmed Developer Contribution Box */}
        <div className="contribution-card__focus-box">
          <div className="contribution-card__focus-header">
            <Layers size={14} />
            <span>My Contributions:</span>
          </div>
          <ul className="contribution-card__focus-list">
            {site.contributionPoints.map((point) => (
              <li key={point}>
                <CheckCircle2 size={14} className="contribution-check-icon" />
                <span className="contribution-point-text">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Technologies Used */}
        <div className="contribution-card__tech">
          <span className="tech-label">Technologies Used:</span>
          <div className="tag-list">
            {site.technologies.map((tech) => (
              <span key={tech} className={tech.includes('[') ? 'tag--placeholder' : ''}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="contribution-card__footer">
        <a
          href={site.url}
          target="_blank"
          rel="noreferrer"
          className="button button--solid contribution-card__cta"
          data-cursor="visit"
        >
          <span>Visit Live Website</span>
          <ExternalLink size={15} />
        </a>
      </div>
    </motion.article>
  )
}
