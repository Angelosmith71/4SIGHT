import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}','./src/components/**/*.{js,ts,jsx,tsx,mdx}','./src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        neoCrimson:   '#FF2E4C',
        electricCyan: '#00E6FF',
        deepVoid:     '#05060A',
        graphite:     '#1A1D22',
        plasmaViolet: '#A45CFF',
        solarAmber:   '#FFB648',
        emeraldPulse: '#00FF9C',
      },
      fontFamily: {
        rajdhani: ['var(--font-rajdhani)', 'sans-serif'],
        mono:     ['var(--font-share-tech-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
