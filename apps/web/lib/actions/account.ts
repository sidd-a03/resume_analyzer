"use server"

import { requireUser } from "@/lib/session"

/** Deletes every resume and analysis but keeps the account and its credits. */
export async function deleteAllResumes() {
  await requireUser()
  // TODO: delete all resumes and analyses in the backend, then refresh()
}
