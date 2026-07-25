import { defineConfig } from '@syncedco/flow/config'
import { themePresets } from '@syncedco/flow/presets'

const syncedMotionColours = {
  ...themePresets.darkApp.colours,
  background: 'oklch(16% 0.025 255)',
  foreground: 'oklch(96% 0.012 82)',
  muted: 'oklch(70% 0.018 240)',
  subtle: 'oklch(38% 0.02 255)',
  surface: 'oklch(20% 0.027 252)',
  surfaceAlt: 'oklch(96% 0.012 82)',
  surfaceRaised: 'oklch(24% 0.028 250)',
  surfaceRaised2: 'oklch(27% 0.026 248)',
  surfaceHover: 'oklch(68% 0.1 181 / 0.12)',
  surfaceInset: 'oklch(13% 0.026 256)',
  borderSubtle: 'oklch(100% 0 0 / 0.08)',
  border: 'oklch(100% 0 0 / 0.13)',
  borderStrong: 'oklch(0% 0 0 / 0.16)',
  backdrop: 'oklch(0% 0 0 / 0.72)',
  primary: 'oklch(68% 0.1 181)',
  primaryHover: 'oklch(74% 0.1 181)',
  primaryForeground: 'oklch(16% 0.025 255)',
  primarySoft: 'oklch(68% 0.1 181 / 0.14)',
  primarySoftBorder: 'oklch(68% 0.1 181 / 0.32)',
  link: 'oklch(68% 0.1 181)',
  linkHover: 'oklch(74% 0.1 181)',
  accent: 'oklch(74% 0.11 75)',
  accentForeground: 'oklch(16% 0.025 255)',
  danger: 'oklch(62% 0.15 28)',
  dangerForeground: 'oklch(96% 0.012 82)',
  categorical1: 'oklch(68% 0.1 181)',
  categorical2: 'oklch(74% 0.11 75)',
  categorical3: 'oklch(62% 0.15 28)',
  categorical4: 'oklch(96% 0.012 82)',
  categorical5: 'oklch(70% 0.018 240)',
  categorical6: 'oklch(38% 0.02 255)',
  ring: 'oklch(74% 0.1 181)',
}

export default defineConfig({
  scan: ['example'],
  out: 'example/synced-flow.generated.css',
  responsiveVariants: false,
  theme: {
    ...themePresets.darkApp,
    colours: syncedMotionColours,
    darkColours: syncedMotionColours,
    layout: {
      ...themePresets.darkApp.layout,
      containerMax: '92rem',
      gutter: 'var(--sf-space-s-l)',
    },
  },
})
