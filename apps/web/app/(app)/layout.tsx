import { AppHeader } from "@/components/layout/app-header"

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppHeader />
      <main className="flex-1">{children}</main>
    </>
  )
}
