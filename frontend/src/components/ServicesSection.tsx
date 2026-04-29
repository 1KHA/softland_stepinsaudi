import React from 'react';
import { motion } from 'framer-motion';
import { Building2, FileCheck, HeadphonesIcon } from 'lucide-react';
import { useTranslation } from '../../node_modules/react-i18next';
import { SectionHeader } from './SectionHeader';

export function ServicesSection() {
  const { t } = useTranslation();
  const services = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: t('services.items.companyFormation.title'),
      description: t('services.items.companyFormation.description')
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: t('services.items.licenses.title'),
      description: t('services.items.licenses.description')
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8" />,
      title: t('services.items.support.title'),
      description: t('services.items.support.description')
    }
  ];

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  return (
    <section id="services" className="bg-white py-20">
      <div className="section-shell">
        <SectionHeader
          badge={t('services.badge')}
          title={t('services.title')}
          description={t('services.description')}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: '-100px'
          }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          
          {services.map((service, index) =>
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-gold via-brand-gold to-brand-navy opacity-80"></div>

              <div className="w-16 h-16 bg-brand-cream rounded-xl flex items-center justify-center text-brand-navy mb-6 group-hover:bg-brand-navy group-hover:text-brand-gold transition-colors duration-300">
                {service.icon}
              </div>

              <h3 className="mb-3 text-xl font-semibold text-brand-navy">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>);

}
