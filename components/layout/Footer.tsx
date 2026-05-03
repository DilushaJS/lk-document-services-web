'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const footerLinks = {
    services: {
      title: 'Services',
      links: [
        { href: '/services/business', label: 'Business Services' },
        { href: '/services/personal-family', label: 'Personal & Family' },
        { href: '/services/wills-trusts', label: 'Wills & Trusts' },
        { href: '/services/intellectual-property', label: 'Intellectual Property' },
      ],
    },
    support: {
      title: 'Support',
      links: [
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/faqs', label: 'FAQs' },
        { href: '/resources', label: 'Resources' },
        { href: '/contact', label: 'Contact Us' },
      ],
    },
    company: {
      title: 'Company',
      links: [
        { href: '/about', label: 'About Us' },
        { href: '/why-choose-us', label: 'Why Choose Us' },
        { href: '/locations', label: 'Locations' },
        { href: '/careers', label: 'Careers' },
      ],
    },
    legal: {
      title: 'Legal',
      links: [
        { href: '/terms-conditions', label: 'Terms & Conditions' },
        { href: '/privacy-policy', label: 'Privacy Policy' },
        { href: '/disclaimer', label: 'Disclaimer' },
      ],
    },
  }

  return (
    <footer className="bg-[#152029]">
      <div className="max-w-[1508px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-10 lg:gap-12 mb-12 lg:mb-24">
          {/* Logo and Description - Left Section */}
          <div className="max-w-[398px] flex-shrink-0">
            <Link href="/" className="inline-block mb-4 sm:mb-6 transition-opacity duration-300 hover:opacity-80 active:opacity-60">
              <Image
                src="/images/logo/logo.svg"
                alt="LK Document Services"
                width={149}
                height={95}
                className="w-[103px] sm:w-[126px] lg:w-[149px] h-auto"
                priority
              />
            </Link>
            <p className="text-[#A5ACB2] text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-[20px] sm:leading-[21px] lg:leading-[22.4px] tracking-[-0.28px] sm:tracking-[-0.3px] lg:tracking-[-0.32px]">
              LK Document Services is a document preparation service and does not provide legal advice. We are not a law firm.
            </p>
          </div>

          {/* Navigation Links - Right Section */}
          <div className="w-full lg:max-w-[807px] lg:flex-shrink-0 lg:ml-auto">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Services Column */}
              <div>
                <h3 className="text-[#E9EBEC] font-poppins text-[16px] sm:text-[17px] lg:text-[18px] font-semibold leading-[24px] sm:leading-[25px] lg:leading-[27px] tracking-[-0.32px] sm:tracking-[-0.34px] lg:tracking-[-0.36px] mb-3 sm:mb-4">
                  {footerLinks.services.title}
                </h3>
                <ul className="space-y-2.5 sm:space-y-3">
                  {footerLinks.services.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[#7F8993] text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-[20px] sm:leading-[21px] lg:leading-[22.4px] tracking-[-0.28px] sm:tracking-[-0.3px] lg:tracking-[-0.32px] transition-all duration-300 ease-out hover:text-[#DCA700] hover:translate-x-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Column */}
              <div>
                <h3 className="text-[#E9EBEC] font-poppins text-[16px] sm:text-[17px] lg:text-[18px] font-semibold leading-[24px] sm:leading-[25px] lg:leading-[27px] tracking-[-0.32px] sm:tracking-[-0.34px] lg:tracking-[-0.36px] mb-3 sm:mb-4">
                  {footerLinks.support.title}
                </h3>
                <ul className="space-y-2.5 sm:space-y-3">
                  {footerLinks.support.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[#7F8993] text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-[20px] sm:leading-[21px] lg:leading-[22.4px] tracking-[-0.28px] sm:tracking-[-0.3px] lg:tracking-[-0.32px] transition-all duration-300 ease-out hover:text-[#DCA700] hover:translate-x-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Column */}
              <div>
                <h3 className="text-[#E9EBEC] font-poppins text-[16px] sm:text-[17px] lg:text-[18px] font-semibold leading-[24px] sm:leading-[25px] lg:leading-[27px] tracking-[-0.32px] sm:tracking-[-0.34px] lg:tracking-[-0.36px] mb-3 sm:mb-4">
                  {footerLinks.company.title}
                </h3>
                <ul className="space-y-2.5 sm:space-y-3">
                  {footerLinks.company.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[#7F8993] text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-[20px] sm:leading-[21px] lg:leading-[22.4px] tracking-[-0.28px] sm:tracking-[-0.3px] lg:tracking-[-0.32px] transition-all duration-300 ease-out hover:text-[#DCA700] hover:translate-x-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Column */}
              <div>
                <h3 className="text-[#E9EBEC] font-poppins text-[16px] sm:text-[17px] lg:text-[18px] font-semibold leading-[24px] sm:leading-[25px] lg:leading-[27px] tracking-[-0.32px] sm:tracking-[-0.34px] lg:tracking-[-0.36px] mb-3 sm:mb-4">
                  {footerLinks.legal.title}
                </h3>
                <ul className="space-y-2.5 sm:space-y-3">
                  {footerLinks.legal.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[#7F8993] text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-[20px] sm:leading-[21px] lg:leading-[22.4px] tracking-[-0.28px] sm:tracking-[-0.3px] lg:tracking-[-0.32px] transition-all duration-300 ease-out hover:text-[#DCA700] hover:translate-x-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-[#192430] min-h-[60px] sm:min-h-[62px] lg:min-h-[66px] flex items-center justify-center px-4">
        <p className="text-[#E9EBEC] font-poppins text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] font-normal text-center">
          Copyright ©2025 LK Document Services. All Rights Reserved
        </p>
      </div>
    </footer>
  )
}