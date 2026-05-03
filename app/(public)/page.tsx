import HeroSection from '@/components/homepage/HeroSection'
import ServicesSection from '@/components/homepage/ServicesSection'
import TrustSection from '@/components/homepage/TrustSection'
import HowItWorksSection from '@/components/homepage/HowItWorksSection'

export const metadata = {
  title: 'LK Document Services - Professional Legal Services',
  description: 'Expert legal and document services including business formation, notary services, immigration, and trademark registration.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <ServicesSection />
      <HowItWorksSection />
    </>
  )
}
