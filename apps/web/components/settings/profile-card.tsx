import { UserAvatar } from "@/components/shared/user-avatar"
import type { SessionUser } from "@/lib/session"

const memberSince = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" })

export function ProfileCard({ user }: { user: SessionUser }) {
  return (
    <section aria-labelledby="profile-heading" className="rounded-xl border bg-card p-6">
      <h2 id="profile-heading" className="text-xl font-semibold">
        Profile
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your name and picture come from the provider you signed up with.
      </p>

      <div className="mt-6 flex items-center gap-4">
        <UserAvatar name={user.name} image={user.image} size={56} />
        <div className="min-w-0">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Member since {memberSince.format(new Date(user.createdAt))}
          </p>
        </div>
      </div>
    </section>
  )
}
