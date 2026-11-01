"use client"

import { motion } from "motion/react"

import { NumberTicker } from "@/components/ui/number-ticker"
import { scoreTone } from "@/lib/score"
import { cn } from "@/lib/utils"

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

/** Circular score with an animated stroke, colored by score band. */
export function ScoreRing({ score, size = 120, strokeWidth = 10, label, className }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)

  return (
    <div
      role="img"
      aria-label={`Score ${score} out of 100`}
      className={cn("relative inline-grid shrink-0 place-items-center", scoreTone(score), className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-muted" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none" aria-hidden="true">
        <NumberTicker
          value={score}
          className="font-mono font-bold tracking-tight text-foreground"
          style={{ fontSize: size * 0.28 }}
        />
        {label && (
          <span className="mt-1 text-muted-foreground" style={{ fontSize: Math.max(10, size * 0.09) }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
