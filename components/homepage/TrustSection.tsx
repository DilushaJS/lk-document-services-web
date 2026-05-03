'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'

const TrustSection = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, x: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.7,
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="max-w-[1488px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col md:flex-row md:items-center gap-6 sm:gap-8 md:gap-auto justify-between"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {/* Left Content */}
          <div className="flex flex-col justify-center w-full md:w-[1043px]">
            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[70px] font-semibold leading-tight sm:leading-tight md:leading-tight lg:leading-[72px] tracking-0 text-[#152029] mb-6 sm:mb-8"
            >
              Worried about getting it wrong? <br className="hidden sm:block" />
              You're not alone.
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl md:text-2xl lg:text-[24px] text-[#7F8993] font-normal leading-relaxed sm:leading-relaxed md:leading-relaxed lg:leading-[30px] tracking-0"
            >
              Many people feel anxious when dealing with legal paperwork. Questions like "Is this correct?", "Will the court accept it?" and "Should I be using a lawyer?" are completely normal. We're here to help you complete your documents properly, without unnecessary costs or confusion.
            </motion.p>
          </div>

          {/* Right Image */}
          <motion.div
            className="flex justify-center md:justify-end flex-shrink-0"
            variants={imageVariants}
          >
            <div className="relative w-full max-w-[327px] md:w-[327px]">
              <Image
                src="/images/home/trust-section-image.svg"
                alt="Trust section visual"
                width={327}
                height={390}
                className="w-full h-auto rounded-3xl object-cover shadow-lg"
                priority
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default TrustSection