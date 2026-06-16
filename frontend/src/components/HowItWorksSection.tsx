import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from './SectionHeader';

export function HowItWorksSection() {
  const { t } = useTranslation();
  const steps = [
    { number: '01', title: t('howItWorks.steps.one.title'), description: t('howItWorks.steps.one.description') },
    { number: '02', title: t('howItWorks.steps.two.title'), description: t('howItWorks.steps.two.description') },
    { number: '03', title: t('howItWorks.steps.three.title'), description: t('howItWorks.steps.three.description') },
    { number: '04', title: t('howItWorks.steps.four.title'), description: t('howItWorks.steps.four.description') },
    { number: '05', title: t('howItWorks.steps.five.title'), description: t('howItWorks.steps.five.description') }
  ];

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-brand-cream py-20">
      <div className="section-shell relative z-10">
        <SectionHeader
          badge={t('howItWorks.badge')}
          title={t('howItWorks.title')}
          description={t('howItWorks.description')}
        />

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-brand-navy/10 md:hidden"></div>
          <div className="hidden md:block absolute top-10 left-10 right-10 h-px bg-brand-navy/10 z-0"></div>

          <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-5 md:items-start">
            {steps.map((step, index) =>
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 30
              }}
              whileInView={{
                opacity: 1,
                y: 0
              }}
              viewport={{
                once: true
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.2
              }}
              className="relative flex gap-5 md:flex md:flex-col md:items-center md:text-center">
                <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold shadow-lg md:mx-auto md:h-20 md:w-20 md:rounded-full md:border-8 md:border-brand-cream">
                  <span className="text-lg font-bold md:text-2xl">
                    {step.number}
                  </span>
                </div>

                <div className="min-w-0 flex-1 rounded-2xl bg-white/70 p-5 shadow-sm md:mt-6 md:flex md:min-h-[260px] md:w-full md:max-w-[220px] md:flex-col md:justify-start">
                  <h3 className="text-lg font-semibold leading-snug text-brand-navy md:min-h-[72px]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-gray-600 leading-relaxed md:flex-1">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>);

}