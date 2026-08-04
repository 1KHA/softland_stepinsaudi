// ─────────────────────────────────────────────────────────────────────────────
// StepIn Saudi wordmark and spectrum bar.
// Source: brand/StepIn Brand Guidelines §01 (الشعار المعتمد) and §02 (الألوان).
//
// The mark is TYPOGRAPHIC, not an image: "Step" with a capital S in navy, "in"
// in cyan, both Bold; "SAUDI" beneath in gray with wide letter-spacing. The
// guidelines forbid redrawing the wordmark or altering its colours and weights,
// so those values are fixed here and deliberately not exposed as props.
//
// Clear space equal to the height of the "S" is reserved on all sides via the
// wrapper padding. Minimum on-screen width is 120px (§01), which `md` and `lg`
// satisfy; `sm` is for tight chrome such as a collapsed sidebar, where the
// SAUDI line is dropped rather than rendered below its legible size.
// ─────────────────────────────────────────────────────────────────────────────

type LogoSize = 'sm' | 'md' | 'lg';

interface StepInLogoProps {
  size?: LogoSize;
  /** Reverse (on-navy) lockup — §01 النسخة العكسية. */
  inverse?: boolean;
  /** Hide the SAUDI descender line. Automatic at `sm`. */
  hideSaudi?: boolean;
  className?: string;
}

const WORD_SIZE: Record<LogoSize, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl'
};

const SAUDI_SIZE: Record<LogoSize, string> = {
  sm: 'text-[7px]',
  md: 'text-[9px]',
  lg: 'text-xs'
};

export function StepInLogo({
  size = 'md',
  inverse = false,
  hideSaudi = false,
  className = ''
}: StepInLogoProps) {
  const showSaudi = !hideSaudi && size !== 'sm';

  // On navy, "Step" reverses to white; "in" stays cyan in both lockups so the
  // accent never disappears. SAUDI lightens for contrast rather than changing hue.
  const stepColor = inverse ? 'text-white' : 'text-brand-navy';
  const saudiColor = inverse ? 'text-white/70' : 'text-brand-gray';

  return (
    <span
      className={`inline-flex flex-col leading-none ${className}`}
      // The wordmark is a brand name, not translatable UI copy.
      translate="no"
      dir="ltr"
      aria-label="StepIn Saudi"
    >
      <span className={`font-bold tracking-tight ${WORD_SIZE[size]}`}>
        <span className={stepColor}>Step</span>
        <span className="text-brand-cyan">in</span>
      </span>

      {showSaudi && (
        <span
          className={`font-semibold uppercase tracking-[0.42em] ${SAUDI_SIZE[size]} ${saudiColor}`}
          aria-hidden="true"
        >
          Saudi
        </span>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// شريط الطيف — the spectrum bar (§02).
// "عنصر تمييز أساسي": a top rule on shells and documents, and a divider under
// headings. Explicitly NOT a full background and never behind text, so this
// renders a thin rule only.
// ─────────────────────────────────────────────────────────────────────────────
export function SpectrumBar({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-1 w-full shrink-0 bg-brand-spectrum ${className}`}
      role="presentation"
    />
  );
}

export default StepInLogo;
