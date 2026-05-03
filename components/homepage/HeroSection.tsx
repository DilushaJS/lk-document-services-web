'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'

export default function HeroSection() {
  const images = [
    { src: '/images/home/hero-image-1.svg', alt: 'Service example 1' },
    { src: '/images/home/hero-image-2.svg', alt: 'Service example 2' },
    { src: '/images/home/hero-image-3.svg', alt: 'Service example 3' },
  ]

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
    hidden: { opacity: 0, y: 20 },
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
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <section className="bg-[#152029] py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="max-w-[1488px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <div>
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-medium leading-tight sm:leading-tight md:leading-tight lg:leading-[92px] tracking-[0px] text-white text-center mb-6 sm:mb-8"
            >
              Legal <span className='text-[#DCA700]'>Documents</span>, prepared <span className='text-[#DCA700]'>correctly </span>
              without the stress.
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl md:text-2xl lg:text-[24px] text-[#A5ACB2] font-normal mb-10 sm:mb-14 md:mb-16 lg:mb-20 leading-relaxed sm:leading-relaxed md:leading-relaxed lg:leading-[30px] tracking-0 max-w-[687px] mx-auto text-center"
            >
              We help you complete legal documents accurately and confidently, following your instructions and court requirements.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex justify-center items-center gap-4 mb-12 sm:mb-16 md:mb-20 lg:mb-20"
            >
              <Link 
                href="/appointment" 
                className="bg-[#DFDEE2] text-[#21203B] px-6 sm:px-8 py-3 sm:py-5 rounded-lg sm:rounded-[12px] font-semibold text-base sm:text-lg md:text-xl lg:text-[20px] leading-6 sm:leading-7 md:leading-8 lg:leading-[25px] tracking-0 transition-all duration-300 hover:bg-white hover:shadow-lg hover:scale-105 flex items-center justify-between w-full sm:w-auto lg:w-[250px]"
              >
                <span className="flex-1 text-center lg:flex-1">Get Started</span>
                <ArrowUpRight size={18} className="sm:w-5 sm:h-5 md:size-5 lg:size-5 flex-shrink-0 ml-2 lg:ml-0" color="#21203B" />
              </Link>
            </motion.div>

            {/* Image Gallery */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-7 lg:gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {images.map((image, index) => (
                <motion.div 
                  key={index}
                  className="flex justify-center"
                  variants={imageVariants}
                >
                  <div className="relative w-full max-w-[471px]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={471}
                      height={632}
                      className="w-full h-auto rounded-lg sm:rounded-xl object-cover shadow-md hover:shadow-xl transition-shadow duration-300"
                      priority={index === 0}
                    />
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
