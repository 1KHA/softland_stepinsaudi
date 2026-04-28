import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../node_modules/react-i18next';
import { SectionHeader } from './SectionHeader';

export function AboutSection() {
  const { t } = useTranslation();
  const points = [t('about.points.one'), t('about.points.two'), t('about.points.three')];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="section-shell">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{
              opacity: 0,
              x: 50
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.6
            }}
            className="lg:w-1/2">
            <div className="glass-panel p-8 sm:p-10">
              <div className="grid gap-5">
                {points.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-2xl border border-brand-navy/10 bg-white p-4">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" />
                    <p className="text-brand-navy">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: -50
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.6
            }}
            className="lg:w-1/2">
            <SectionHeader
              align="left"
              badge={t('about.badge')}
              title={t('about.title')}
            />

            <p className="mb-8 mt-6 text-gray-600 leading-relaxed">
              {t('about.paragraphOne')}
            </p>
            <p className="mb-10 text-gray-600 leading-relaxed">
              {t('about.paragraphTwo')}
            </p>

            <div className="rounded-3xl border border-brand-navy/10 bg-brand-cream p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-brand-navy">{t('about.cardTitle')}</h3>
              <p className="mt-3 text-gray-600">{t('about.points.three')}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}