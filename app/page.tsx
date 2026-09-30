import { ActivityGrid } from "@/components/activities/ActivityGrid"
import { AirportTransfer } from "@/components/site/AirportTransfer"
import { Hero } from "@/components/site/Hero"
import { HowItWorks } from "@/components/site/HowItWorks"
import { SiteFooter } from "@/components/site/SiteFooter"
import { SiteHeader } from "@/components/site/SiteHeader"
import { MyTripBar } from "@/components/trip/MyTripBar"
import { TripProvider } from "@/components/trip/TripProvider"

export default function HomePage() {
  return (
    <TripProvider>
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <ActivityGrid />
        <AirportTransfer />
      </main>
      <SiteFooter />
      <MyTripBar />
    </TripProvider>
  )
}
