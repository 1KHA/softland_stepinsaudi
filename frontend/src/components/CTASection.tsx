import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from './SectionHeader';

export function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-brand-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="section-shell relative z-10">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          whileInView={{
            opacity: 1,
            scale: 1
          }}
          viewport={{
            once: true
          }}
          transition={{
            duration: 0.5
          }}
          className="mx-auto max-w-4xl text-center">
          <SectionHeader
            badge={t('common.brand')}
            title={t('cta.title')}
            description={t('cta.description')}
            light
          />

          <Link
            to="/login"
            className="mt-10 inline-flex rounded-full bg-brand-gold px-10 py-4 font-semibold text-brand-navy transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-500 hover:shadow-[0_10px_20px_rgba(197,165,90,0.3)]">
            {t('cta.action')}
          </Link>
        </motion.div>
      </div>
    </section>);

}