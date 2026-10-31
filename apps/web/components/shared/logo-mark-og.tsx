// Plain-SVG version of the logo mark for next/og image routes (Satori can't read CSS variables).
export function LogoMarkOg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="#1D1C19" />
      <rect x="7.5" y="5.5" width="17" height="21" rx="1.8" fill="#F7F5F0" />
      <rect x="10.5" y="9" width="7" height="1.6" rx=".8" fill="#1D1C19" fillOpacity=".35" />
      <rect x="9.6" y="12.6" width="12.8" height="3.4" rx=".7" fill="#FFE16B" />
      <rect x="10.5" y="13.5" width="10" height="1.6" rx=".8" fill="#1D1C19" fillOpacity=".8" />
      <rect x="10.5" y="18.6" width="6.5" height="1.6" rx=".8" fill="#1D1C19" fillOpacity=".35" />
      <rect x="10.5" y="21.8" width="4.5" height="1.6" rx=".8" fill="#1D1C19" fillOpacity=".35" />
      <path
        d="m18.4 20.6 1.9 2 3.9-4.6"
        stroke="#D9480F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
