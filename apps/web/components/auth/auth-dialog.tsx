"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { createContext, Suspense, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { AuthHeader, authSubtitle, authTitle } from "@/components/auth/auth-header"
import { AuthOptions } from "@/components/auth/auth-options"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

type AuthDialogContextValue = {
  openAuth: () => void
}

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null)

export function useAuthDialog() {
  const ctx = use(AuthDialogContext)
  if (!ctx) throw new Error("useAuthDialog must be used inside <AuthDialogProvider>.")
  return ctx
}
/**
 * Opens the dialog when the URL carries `?auth=1`, then strips the params. better-auth's
 * `onAPIError.errorURL` points here, so a failed OAuth round trip also brings `?error=<code>`.
 */
function AuthQuerySync({ onOpen }: { onOpen: (errorCode?: string) => void }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (searchParams.get("auth") !== "1") return
    onOpen(searchParams.get("error") ?? undefined)
    const next = new URLSearchParams(searchParams)
    next.delete("auth")
    next.delete("error")
    next.delete("error_description")
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [searchParams, router, pathname, onOpen])

  return null
}

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [errorCode, setErrorCode] = useState<string>()
  const isDesktop = useMediaQuery("(min-width: 640px)", true)

  const openAuth = useCallback((code?: string) => {
    setErrorCode(code)
    setOpen(true)
  }, [])
  const value = useMemo(() => ({ openAuth: () => openAuth() }), [openAuth])

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setErrorCode(undefined)
  }

  return (
    <AuthDialogContext value={value}>
      {children}
      <Suspense fallback={null}>
        <AuthQuerySync onOpen={openAuth} />
      </Suspense>

      {isDesktop ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="gap-6 rounded-xl p-7 sm:max-w-[420px]">
            <AuthHeader
              title={<DialogTitle className="font-heading text-xl font-bold tracking-tight">{authTitle}</DialogTitle>}
              description={<DialogDescription>{authSubtitle}</DialogDescription>}
            />
            <AuthOptions errorCode={errorCode} />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
          <DrawerContent>
            <div className="flex flex-col gap-6 px-5 pt-4 pb-8">
              <AuthHeader
                title={<DrawerTitle className="text-xl font-bold tracking-tight">{authTitle}</DrawerTitle>}
                description={<DrawerDescription className="text-muted-foreground">{authSubtitle}</DrawerDescription>}
              />
              <AuthOptions errorCode={errorCode} />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </AuthDialogContext>
  )
}
