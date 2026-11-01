export function scoreTone(score: number) {
  if (score >= 75) return "text-success"
  if (score >= 50) return "text-warning"
  return "text-destructive"
}
