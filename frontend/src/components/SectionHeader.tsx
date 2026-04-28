import React from 'react';

type SectionHeaderProps = {
  badge?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  light?: boolean;
};

export function SectionHeader({
  badge,
  title,
  description,
  align = 'center',
  light = false
}: SectionHeaderProps) {
  const alignment = align === 'left' ? 'text-left rtl:text-right' : 'text-center';

  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto' : ''} ${alignment}`}>
      {badge && (
        <span className={`mb-4 inline-flex rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${light ? 'bg-white/10 text-brand-gold' : 'bg-brand-navy/5 text-brand-navy'}`}>
          {badge}
        </span>
      )}
      <h2 className={`section-heading ${light ? 'text-white' : 'text-brand-navy'}`}>{title}</h2>
      {description && (
        <p className={`mt-4 ${light ? 'text-slate-300' : 'section-copy'}`}>{description}</p>
      )}
    </div>
  );
}