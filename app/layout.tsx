import type { Metadata } from "next"
import { Montserrat, Playfair_Display, Raleway } from "next/font/google"
import { Analytics, TrackingNoScript } from "@/components/site/Analytics"
import "./globals.css"

// All three are variable fonts; Playfair only ships 400+, which is what the live site renders
// anyway (it asks for 200/300 and the browser clamps).
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" })
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" })

const SITE_TITLE = "Cabo Deals — Do everything in Cabo. Pay what locals pay."
const SITE_DESCRIPTION =
  "Insider pricing on Cabo's best adventures — for your whole stay. Join us for breakfast and a 90-minute look at a partner resort, and the prices are yours. Nothing is charged online."

export const metadata: Metadata = {
  metadataBase: new URL("https://cabodeals.mx"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: "Cabo Deals",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${raleway.variable} ${montserrat.variable}`}>
      <body>
        {/* GTM's noscript iframe has to be the first element in the body to fire at all. */}
        <TrackingNoScript />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
