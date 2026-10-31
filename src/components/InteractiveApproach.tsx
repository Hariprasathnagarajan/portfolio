import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  FileCode,
  Cpu,
  CheckCircle,
  ArrowRight,
  ListChecks,
} from 'lucide-react'

interface ProcessStep {
  number: string
  title: string
  subtitle: string
  icon: typeof HelpCircle
  summary: string
  activities: string[]
  deliverable: string
}

const stepsData: ProcessStep[] = [
  {
    number: '01',
    title: 'Understand',
    subtitle: 'Requirements & Problem Formulation',
    icon: HelpCircle,
    summary:
      'Identify the user’s real problem, constraints, edge cases, and expected outcome before writing any code.',
    activities: [
      'Deconstruct the core problem from the user and business perspective',
      'Map inputs, outputs, edge cases, and required authentication rules',
      'Research existing patterns, API constraints, and performance bottlenecks',
    ],
    deliverable: 'Clear problem statement, user workflows, and feature boundary definition.',
  },
  {
    number: '02',
    title: 'Plan',
    subtitle: 'Data Architecture & System Contracts',
    icon: FileCode,
    summary:
      'Break the problem into modular tasks, define database models, and specify clean application architecture.',
    activities: [
      'Model relational database entities, fields, foreign keys, and indexes',
      'Design RESTful API routes, request schemas, and error contract shapes',
      'Establish frontend component trees, responsive layouts, and state boundaries',
    ],
    deliverable: 'Database schema, API endpoint contracts, and modular component hierarchy.',
  },
  {
    number: '03',
    title: 'Build',
    subtitle: 'Implementation & Integration',
    icon: Cpu,
    summary:
      'Develop responsive interfaces, robust backend services, and clean API integrations with maintainable code.',
    activities: [
      'Build backend models, serializers, and business logic with test fixtures',
      'Implement accessible, responsive UI components with clean feedback states',
      'Connect API endpoints, JWT token lifecycles, and asynchronous error handlers',
    ],
    deliverable: 'Functional end-to-end features with clean typing, error guards, and responsive UI.',
  },
  {
    number: '04',
    title: 'Refine',
    subtitle: 'Testing, Polish & Documentation',
    icon: CheckCircle,
    summary:
      'Test the application thoroughly, fix issues across devices, improve usability, and document the final result.',
    activities: [
      'Conduct cross-device and cross-browser testing down to 360px viewports',
      'Optimize API payloads, database query counts, and component re-renders',
      'Write clear README setup documentation, API guides, and code comments',
    ],
    deliverable: 'Documented, tested, and reliable deployment ready for production.',
  },
]

export function InteractiveApproach() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  const activeStep = stepsData[activeStepIndex]
  const ActiveIcon = activeStep.icon

  return (
    <div className="interactive-approach">
      {/* Step Navigation Bar / Progress Line */}
      <div className="process-nav">
        <div className="process-nav__progress-track" aria-hidden="true">
          <motion.div
            className="process-nav__progress-fill"
            animate={{ width: `${(activeStepIndex / (stepsData.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="process-nav__steps-row" role="tablist" aria-label="Process Steps">
          {stepsData.map((step, index) => {
            const Icon = step.icon
            const isActive = index === activeStepIndex
            const isCompleted = index < activeStepIndex

            return (
              <button
                key={step.number}
                role="tab"
                aria-selected={isActive}
                className={`step-btn ${isActive ? 'step-btn--active' : ''} ${
                  isCompleted ? 'step-btn--completed' : ''
                }`}
                onClick={() => setActiveStepIndex(index)}
                onMouseEnter={() => setActiveStepIndex(index)}
                data-cursor="step"
              >
                <div className="step-btn__circle">
                  <Icon size={16} />
                </div>
                <div className="step-btn__text">
                  <span className="step-btn__number">{step.number}</span>
                  <span className="step-btn__title">{step.title}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Step Detailed Showcase */}
      <div className="process-detail-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.number}
            className="process-detail-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="process-detail-card__header">
              <div className="process-step-badge">
                <span className="process-step-badge__num">{activeStep.number}</span>
                <span className="process-step-badge__sep">/</span>
                <span className="process-step-badge__sub">{activeStep.subtitle}</span>
              </div>
              <div className="process-step-icon-wrap">
                <ActiveIcon size={24} />
              </div>
            </div>

            <h3 className="process-detail-card__title">{activeStep.title}</h3>
            <p className="process-detail-card__summary">{activeStep.summary}</p>

            <div className="process-activities-box">
              <div className="process-activities-header">
                <ListChecks size={15} />
                <span>Core Activities:</span>
              </div>
              <ul className="process-activities-list">
                {activeStep.activities.map((act) => (
                  <li key={act}>
                    <ArrowRight size={13} className="activity-bullet" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="process-deliverable-bar">
              <span className="deliverable-label">Key Outcome:</span>
              <span className="deliverable-text">{activeStep.deliverable}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
