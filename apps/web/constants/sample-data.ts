// Fictional sample used by every mock on the landing page, so the page tells one story.
// "Riya Kapoor" is not a real person.

export type Severity = "high" | "medium" | "low"

export const sampleResume = {
  name: "Riya Kapoor",
  role: "Frontend Developer (Fresher)",
  fileName: "riya-kapoor-resume.pdf",
  score: 82,
  scoreLabel: "Strong start",
}

export const sampleBreakdown = [
  { label: "Impact", value: 74 },
  { label: "Clarity", value: 88 },
  { label: "ATS-friendly", value: 91 },
]

export const sampleIssues: { title: string; severity: Severity }[] = [
  { title: "Most bullets describe duties, not results", severity: "high" },
  { title: "Skills section is missing tools from your projects", severity: "medium" },
  { title: "Summary is 5 lines long, aim for 2-3", severity: "low" },
]

export const sampleSections = [
  { name: "Summary", status: "Needs work" },
  { name: "Experience", status: "Good" },
  { name: "Projects", status: "Strong" },
  { name: "Skills", status: "Needs work" },
  { name: "Education", status: "Good" },
] as const

export const sampleKeywords = {
  found: ["React", "TypeScript", "REST APIs", "Git", "Tailwind CSS"],
  missing: ["Next.js", "Unit testing", "Accessibility", "CI/CD", "Figma", "Redux"],
}

export const sampleRewrite = {
  before: "Worked on the college fest website.",
  after:
    "Built the college fest website in React for 4,000+ visitors, cutting page load time by 38% with image lazy-loading.",
}

export const sampleJobMatch = {
  jobTitle: "Junior Frontend Engineer",
  jd: "We're looking for a Junior Frontend Engineer comfortable with React, Next.js and TypeScript. You will write unit tests, care about accessibility, and ship through a CI/CD pipeline...",
  match: 68,
  missing: ["Next.js", "Unit testing", "CI/CD"],
  suggestion:
    "Migrated a personal portfolio from Create React App to Next.js, adding Jest unit tests and a GitHub Actions deploy pipeline.",
}

export const lockedCount = 11
