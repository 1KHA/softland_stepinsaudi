import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';

export function HeroSection() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const stats = [
    {
      label: t('hero.statOneLabel'),
      value: t('hero.statOneValue')
    },
    {
      label: t('hero.statTwoLabel'),
      value: t('hero.statTwoValue')
    },
    {
      label: t('hero.statThreeLabel'),
      value: t('hero.statThreeValue')
    }
  ];

  return (
    <section id="home" className="relative overflow-hidden bg-brand-cream pt-32 pb-20 lg:pt-44 lg:pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(197,165,90,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(30,58,95,0.1),_transparent_30%)]"></div>

      <div className="section-shell relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="glass-panel grid items-center gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-14">
            <div className="text-center lg:text-left rtl:lg:text-right">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                <CheckCircle2 className="h-4 w-4" />
                {t('hero.badge')}
              </motion.span>
              <motion.h1
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.6
                }}
                className="mx-auto mb-6 max-w-3xl text-h1 text-brand-navy lg:mx-0 lg:max-w-2xl">
                {t('hero.title')}
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.2
                }}
                className="mx-auto mb-10 max-w-2xl text-gray-700 lg:mx-0">
                {t('hero.description')}
              </motion.p>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.4
                }}
                className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <Link
                  to="/login"
                  className="primary-button w-full sm:w-auto group">
                  <span>{t('hero.primaryCta')}</span>
                  <ArrowIcon className={`h-5 w-5 transition-transform ${isArabic ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                </Link>

                <a
                  href="#how-it-works"
                  className="secondary-button w-full sm:w-auto text-center">
                  {t('hero.secondaryCta')}
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-brand-navy/10 bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-sm font-semibold text-brand-gold">{stat.value}</p>
                  <p className="mt-2 text-brand-navy">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>);

}