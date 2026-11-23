import {
  HISTORY_PAGE_SIZE,
  HISTORY_SEARCH_MAX_CHARS,
  HISTORY_SORTS,
  type HistorySort,
} from "@repo/validation"

import { analysisStatuses, analysisTypes } from "@/constants/analysis"
import { toAnalysisSummary, type ApiHistoryPage } from "@/lib/analysis-api"
import type { AnalysisStatus, AnalysisSummary, AnalysisType } from "@/lib/types"


export type HistoryParams = {
  page: number
  pageSize: number
  type: AnalysisType | null
  status: AnalysisStatus | null
  search: string
  sort: HistorySort
  order: "asc" | "desc"
}

export type HistoryPage = { items: AnalysisSummary[]; total: number }

export const defaultHistoryParams: HistoryParams = {
  page: 1,
  pageSize: HISTORY_PAGE_SIZE.default,
  type: null,
  status: null,
  search: "",
  sort: "createdAt",
  order: "desc",
}

export const recentAnalysesParams: HistoryParams = { ...defaultHistoryParams, pageSize: 6 }

type RawParams = URLSearchParams | Record<string, string | string[] | undefined>

const read = (raw: RawParams, key: string) => {
  const value = raw instanceof URLSearchParams ? raw.get(key) : raw[key]
  return (Array.isArray(value) ? value[0] : value) ?? null
}

const oneOf = <T extends string>(value: string | null, allowed: readonly T[]) =>
  allowed.includes(value as T) ? (value as T) : null

const positiveInt = (value: string | null, max: number) => {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 && n <= max ? n : null
}

export function parseHistoryParams(raw: RawParams): HistoryParams {
  const d = defaultHistoryParams
  return {
    page: positiveInt(read(raw, "page"), 10_000) ?? d.page,
    pageSize: positiveInt(read(raw, "size"), HISTORY_PAGE_SIZE.max) ?? d.pageSize,
    type: oneOf(read(raw, "type"), Object.keys(analysisTypes) as AnalysisType[]),
    status: oneOf(read(raw, "status"), Object.keys(analysisStatuses) as AnalysisStatus[]),
    search: (read(raw, "q") ?? "").trim().slice(0, HISTORY_SEARCH_MAX_CHARS),
    sort: oneOf(read(raw, "sort"), HISTORY_SORTS) ?? d.sort,
    order: oneOf(read(raw, "order"), ["asc", "desc"] as const) ?? d.order,
  }
}


export function historyUrlQuery(p: HistoryParams): string {
  const d = defaultHistoryParams
  const q = new URLSearchParams()
  if (p.page !== d.page) q.set("page", String(p.page))
  if (p.pageSize !== d.pageSize) q.set("size", String(p.pageSize))
  if (p.type) q.set("type", p.type)
  if (p.status) q.set("status", p.status)
  if (p.search) q.set("q", p.search)
  if (p.sort !== d.sort || p.order !== d.order) {
    q.set("sort", p.sort)
    q.set("order", p.order)
  }
  const text = q.toString()
  return text ? `?${text}` : ""
}

export function historyApiPath(p: HistoryParams): string {
  const q = new URLSearchParams({ 
    page: String(p.page), 
    pageSize: String(p.pageSize), 
    sort: p.sort, 
    order: p.order 
  })

  if (p.type) q.set("type", p.type.toUpperCase())
  if (p.status) q.set("status", p.status.toUpperCase())
  if (p.search) q.set("search", p.search)

  return `/analyses?${q}`
}

export const hasHistoryFilters = (p: HistoryParams) => Boolean(p.type || p.status || p.search)

export const toHistoryPage = (page: ApiHistoryPage): HistoryPage => ({
  items: page.items.map(toAnalysisSummary),
  total: page.total,
})
