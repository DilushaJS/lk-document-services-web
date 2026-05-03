'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'

const HowItWorksSection = () => {
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

  const badgeVariants: Variants = {
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

  const imageVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const titleVariants: Variants = {
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

  const stepVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
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

  const steps = [
    {
      number: 1,
      title: 'Choose the service you need',
      description: 'Select the document or service that matches your situation.',
    },
    {
      number: 2,
      title: 'Answer simple questions',
      description: 'Select the document or service that matches your situation.',
    },
    {
      number: 3,
      title: 'We prepare your documents',
      description: 'Select the document or service that matches your situation.',
    },
    {
      number: 4,
      title: 'Review, sign and file',
      description: 'Select the document or service that matches your situation.',
    },
  ]

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="max-w-[1488px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* How It Works Badge */}
        <motion.div
          className="flex justify-center mb-12 lg:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={badgeVariants}
        >
          <div className="w-[165px] h-[59px] bg-[#DCA70014] rounded-[20px] flex items-center justify-center">
            <span className="font-poppins font-medium text-[16px] sm:text-[18px] lg:text-[20px] leading-[100%] text-center text-[#DCA700]">
              How It Works
            </span>
          </div>
        </motion.div>

        {/* Main Content - Image and Steps */}
        <motion.div
          className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Left Image */}
          <motion.div
            className="w-full lg:w-[623px] h-[300px] sm:h-[400px] lg:h-[794px] rounded-[20px] sm:rounded-[24px] overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#F9F9F9]"
            variants={imageVariants}
          >
            <Image
              src="/images/home/how-it-works.svg"
              alt="Professional working on documents"
              width={623}
              height={794}
              className="w-auto h-full object-contain"
            />
          </motion.div>

          {/* Right Content - Title and Steps */}
          <div className="w-full lg:w-[710px] flex flex-col gap-[40px] sm:gap-[50px] lg:gap-[60px]">
            {/* Title */}
            <motion.h2
              className="font-poppins font-semibold text-[28px] sm:text-[40px] lg:text-[70px] leading-[1.17]"
              variants={titleVariants}
            >
              <span className="text-[#152029]">Simple </span>
              <span className="text-[#DCA700]">Steps</span>
              <span className="text-[#152029]"> to Document Preparation</span>
            </motion.h2>

            {/* Steps List */}
            <motion.div
              className="flex flex-col gap-6 sm:gap-7 lg:gap-10"
              variants={containerVariants}
            >
              {steps.map((step) => (
                <motion.div
                  key={step.number}
                  className="flex items-start gap-3 sm:gap-4"
                  variants={stepVariants}
                >
                  {/* Number Circle */}
                  <div className="w-[32px] sm:w-[36px] lg:w-[37px] h-[32px] sm:h-[35px] lg:h-[36px] bg-[#DCA700] rounded-full border border-[#FFFFFF1C] flex items-center justify-center flex-shrink-0 mt-1 sm:mt-1.5 lg:mt-2">
                    <span className="font-poppins font-medium text-[14px] sm:text-[15px] lg:text-[16px] leading-[24px] text-white">
                      {step.number}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    {/* Step Title */}
                    <h3 className="font-poppins font-medium text-[18px] sm:text-[24px] lg:text-[36px] leading-[1.4] sm:leading-[1.5] lg:leading-[1.5] text-[#152029]">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="font-normal text-[14px] sm:text-[16px] lg:text-[18px] leading-[20px] sm:leading-[22px] lg:leading-[23px] text-[#485764]">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorksSection