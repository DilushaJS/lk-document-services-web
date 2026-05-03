'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigationLinks = [
    { href: '/services', label: 'Services' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/resources', label: 'Resources' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="bg-[#152029] sticky top-0 z-50">
      <nav className="max-w-[1488px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-12">
          {/* Logo and Navigation Container */}
          <div className="flex items-center gap-12">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 transition-opacity duration-300 ease-out hover:opacity-80 active:opacity-60">
              <Image
                src="/images/logo/logo.svg"
                alt="LK Document Services"
                width={103}
                height={66}
                className="w-[103px] h-[66px]"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigationLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[18px] font-medium leading-[23px] transition-all duration-300 ease-out pb-2 border-b-2 ${
                      active
                        ? 'text-[#DCA700] border-b-[#DCA700]'
                        : 'text-white border-b-transparent hover:text-[#DCA700] hover:border-b-[#DCA700]'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Desktop CTA Button */}
          <Link
            href="/get-started"
            className="hidden lg:flex px-6 py-3 bg-[#DFDEE2] rounded-[6px] text-[#21203B] text-[16px] font-medium leading-[24px] transition-all duration-300 ease-out items-center justify-center flex-shrink-0 hover:bg-white hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Get Started
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 rounded-md transition-all duration-300 ease-out ml-auto hover:bg-white/10 active:scale-95"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              {navigationLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[18px] font-medium leading-[23px] py-2 px-2 rounded-md transition-all duration-300 ease-out ${
                      active
                        ? 'text-[#DCA700] bg-white/10'
                        : 'text-white hover:text-[#DCA700] hover:bg-white/5'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <Link
                href="/get-started"
                className="w-full h-[38px] bg-[#DFDEE2] rounded-[6px] text-[#21203B] text-[16px] font-medium leading-[24px] transition-all duration-300 ease-out flex items-center justify-center mt-2 hover:bg-white hover:shadow-lg hover:scale-105 active:scale-95"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}