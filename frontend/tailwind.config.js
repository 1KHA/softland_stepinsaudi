export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'selector',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
  // ───────────────────────────────────────────────────────────────────────
  // StepIn Saudi brand palette — brand/StepIn Brand Guidelines §02.
  // These hex values are fixed by the guidelines; do not tune them.
  // ───────────────────────────────────────────────────────────────────────
  brand: {
    navy: '#2B3E8F',   // كحلي أساسي — primary
    cyan: '#1DBAEA',   // سماوي — accent
    blue: '#0D5DA6',   // أزرق
    teal: '#008A84',   // أخضر مزرقّ
    green: '#98C23E',  // أخضر — success
    amber: '#E9A623',  // كهرماني — warning
    yellow: '#FACC0B', // end of the spectrum bar
    gray: '#808184',   // رمادي — secondary text
    ink: '#3B3E3B',    // body copy
    bg: '#F4F7FB',     // خلفية فاتحة — page background
    white: '#FFFFFF',

    // Back-compat aliases. `brand-gold` (56 uses) and `brand-cream` (12) are
    // baked into existing markup; without these they would resolve to nothing
    // and silently drop their styling. They now point at the brand accent and
    // light surface. Prefer brand-cyan / brand-bg in new code.
    gold: '#1DBAEA',
    cream: '#F4F7FB'
  },

  // Legacy token names kept so the ~650 existing `navy-*` / `gold-*` /
  // `cream-*` classes across the dashboards rebrand in place rather than
  // needing a 650-site find-and-replace. `navy` is the brand navy, `gold`
  // (the old accent) now resolves to the brand cyan accent, and `cream`
  // (the old light surface) to the brand light background.
  navy: {
    DEFAULT: '#2B3E8F',
    light: '#3D51A8',
    dark: '#1E2C68',
    card: '#33469C',
  },

  gold: {
    DEFAULT: '#1DBAEA',
    light: '#4ECBF0',
    dark: '#0D5DA6',
  },

  cream: {
    DEFAULT: '#F4F7FB',
    dark: '#D8E4F5',
  },

        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
        sidebar: 'var(--sidebar)',
        'sidebar-foreground': 'var(--sidebar-foreground)',
        'sidebar-primary': 'var(--sidebar-primary)',
        'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
        'sidebar-accent': 'var(--sidebar-accent)',
        'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
        'sidebar-border': 'var(--sidebar-border)',
        'sidebar-ring': 'var(--sidebar-ring)',
        'destructive-foreground': 'var(--destructive-foreground)'
      },
      fontFamily: {
        // One family for Arabic and Latin, per brand guidelines §03.
        // The legacy aliases are kept so existing `font-cairo` / `font-montserrat`
        // markup resolves to the brand face instead of an off-brand fallback.
        sans: ['"IBM Plex Sans Arabic"', 'sans-serif'],
        plex: ['"IBM Plex Sans Arabic"', 'sans-serif'],
        heading: ['"IBM Plex Sans Arabic"', 'sans-serif'],
        cairo: ['"IBM Plex Sans Arabic"', 'sans-serif'],
        montserrat: ['"IBM Plex Sans Arabic"', 'sans-serif'],
        mono: ['"Geist Mono"']
      },
      backgroundImage: {
        // شريط الطيف — the spectrum bar (§02). Used as a top rule on shells and
        // as a divider under headings. Never as a full background or behind text.
        'brand-spectrum':
          'linear-gradient(90deg,#2B3E8F 0%,#0D5DA6 18%,#1DBAEA 38%,#008A84 55%,#98C23E 72%,#E9A623 88%,#FACC0B 100%)'
      }
    }
  }
}