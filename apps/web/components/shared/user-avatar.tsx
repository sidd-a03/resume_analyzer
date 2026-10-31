import Image from "next/image"

import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

/** Provider profile picture, or the user's initials when there isn't one. */
export function UserAvatar({
  name,
  image,
  size = 32,
  className,
}: {
  name: string
  image: string | null
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full border bg-muted font-medium text-muted-foreground",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {image ? <Image src={image} alt="" fill sizes={`${size}px`} className="object-cover" /> : initials(name)}
    </span>
  )
}
