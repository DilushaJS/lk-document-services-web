'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'

interface ServiceItem {
  title: string
  items: string[]
  icon: string
  isLong?: boolean
}

const ServicesSection = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const headingVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const services: ServiceItem[] = [
    {
      title: 'Business Services',
      icon: '/images/home/icons/business.svg',
      isLong: true,
      items: [
        'Company Formation (Ltd, LLP)',
        'Sole Trader Registration',
        'Business Name Registration',
        'Partnership Agreements',
      ],
    },
    {
      title: 'Wills & Trusts',
      icon: '/images/home/icons/wills.svg',
      isLong: false,
      items: [
        'Last Will & Testament',
        'Living Trusts',
        'Healthcare Directives',
      ],
    },
    {
      title: 'Intellectual Property',
      icon: '/images/home/icons/property.svg',
      isLong: false,
      items: [
        'Trademark Registration',
        'Copyright Registration',
      ],
    },
    {
      title: 'Personal & Family',
      icon: '/images/home/icons/family.svg',
      isLong: true,
      items: [
        'Divorce (Uncontested)',
        'Deeds & Property Transfers',
        'Power of Attorney',
        'Probate Assistance',
      ],
    },
  ]

  return (
    <section className="bg-[#F5F5F6] py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="max-w-[1488px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="flex flex-col items-center mb-8 sm:mb-10 md:mb-12 lg:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {/* Services Badge */}
          <motion.div 
            className="w-[120px] h-[59px] bg-[#DCA70014] rounded-[20px] flex items-center justify-center mb-6 sm:mb-8"
            variants={headingVariants}
          >
            <span className="font-[Poppins] font-medium text-[16px] sm:text-[18px] lg:text-[20px] leading-[100%] text-center text-[#DCA700]">
              Services
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2 
            className="max-w-[1066px] font-semibold text-[32px] sm:text-[40px] md:text-[50px] lg:text-[70px] leading-[1.17] text-center mb-4 sm:mb-6"
            variants={headingVariants}
          >
            <span className="text-[#DCA700]">Solutions</span>{' '}
            <span className="text-[#152029]">That Take You in to the Next Level</span>
          </motion.h2>

          {/* Description */}
          <motion.p 
            className="font-medium text-[14px] sm:text-[16px] md:text-[18px] leading-[1.3] sm:leading-[1.4] text-center text-[#7F8993]"
            variants={headingVariants}
          >
            Accurate document preparation made simple.
          </motion.p>
        </motion.div>

        {/* Cards Grid - items-end aligns all cards to bottom */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 items-end justify-items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              className={`w-full max-w-[347px] lg:w-[347px] bg-white rounded-[20px] sm:rounded-[25px] lg:rounded-[30px] px-[20px] sm:px-[28px] lg:px-[35px] py-[30px] sm:py-[38px] lg:py-[45px] flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer ${
                service.isLong
                  ? 'h-auto sm:h-auto lg:h-[493px]'
                  : 'h-auto sm:h-auto lg:h-[392px]'
              }`}
              style={{
                gap: service.isLong ? 'clamp(32px, 5vw, 52px)' : 'clamp(24px, 4vw, 42px)',
              }}
              variants={cardVariants}
            >
              {/* Icon Container */}
              <div className="w-[60px] sm:w-[70px] lg:w-[78.96px] h-[65px] sm:h-[76px] lg:h-[84px] bg-[#233444] rounded-[6px] sm:rounded-[8px] lg:rounded-[9.16px] border-[0.92px] border-[#FFFFFF1C] flex items-center justify-center p-[4px] sm:p-[5px] lg:p-[5.49px]">
                <div className="relative w-[38px] sm:w-[42px] lg:w-[46px] h-[38px] sm:h-[42px] lg:h-[46px]">
                  <Image
                    src={service.icon}
                    alt={service.title}
                    width={46}
                    height={46}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1">
                {/* Card Title */}
                <h3 className="font-semibold text-[20px] sm:text-[24px] lg:text-[28px] leading-[28px] sm:leading-[32px] lg:leading-[36px] text-[#152029] mb-4 sm:mb-5 lg:mb-6">
                  {service.title}
                </h3>

                {/* Bullet Points */}
                <ul className="space-y-1.5 sm:space-y-2">
                  {service.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[22px] sm:leading-[26px] lg:leading-[31px] text-[#485764] flex items-center gap-2"
                    >
                      <span className="text-[#485764] flex-shrink-0">•</span>
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default ServicesSection