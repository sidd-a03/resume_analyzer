import { ImageResponse } from "next/og"

import { LogoMarkOg } from "@/components/shared/logo-mark-og"
import { brand } from "@/constants/brand"

export const alt = `${brand.name}: ${brand.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        color: "#1D1C19",
        background: "#F7F5F0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <LogoMarkOg size={72} />
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>{brand.name}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, maxWidth: 900 }}>
          {brand.tagline}
        </div>
        <div style={{ fontSize: 30, color: "#67635A", maxWidth: 860 }}>{brand.description}</div>
      </div>
    </div>,
    { ...size },
  )
}
