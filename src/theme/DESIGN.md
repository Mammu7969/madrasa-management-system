---
name: Fidelity Dark System
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#31353c'
  on-surface: '#e0e2eb'
  on-surface-variant: '#c1c6d5'
  inverse-surface: '#e0e2eb'
  inverse-on-surface: '#2d3037'
  outline: '#8b919f'
  outline-variant: '#414753'
  surface-tint: '#aac7ff'
  primary: '#aac7ff'
  on-primary: '#002f64'
  primary-container: '#4090fe'
  on-primary-container: '#002958'
  inverse-primary: '#005db8'
  secondary: '#aec7f7'
  on-secondary: '#143057'
  secondary-container: '#2d476f'
  on-secondary-container: '#9db6e4'
  tertiary: '#ffb68c'
  on-tertiary: '#532200'
  tertiary-container: '#e3711f'
  on-tertiary-container: '#481d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458d'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#aec7f7'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#2d476f'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68c'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#763400'
  background: '#10131a'
  on-background: '#e0e2eb'
  surface-variant: '#31353c'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
---

# Design System

## Brand & Style
The design system adopts a **Corporate / Modern** style paired with a **dark color mode**. It is built for reliability, balance, and professionalism, drawing inspiration from modern material design and high-end enterprise applications. The emotional response is secure, focused, and precise, optimized for data-dense and task-oriented environments.

## Colors
The palette is engineered for a dark color mode environment, utilizing deep, desaturated neutral surfaces accented by vibrant, accessible chromatic tones.
- **Primary (`#1275e2`)**: A vivid, trustworthy blue used for primary actions, active states, and key navigational focal points.
- **Secondary (`#5f78a3`)**: A muted slate blue providing balanced contrast for secondary interfaces and supportive elements.
- **Tertiary (`#c55b00`)**: A warm amber-orange accent used selectively for highlights, warnings, or calls to action requiring immediate attention.
- **Neutral (`#74777f`)**: A balanced cool gray utilized for structural borders, text, and surface layering in dark mode.

## Typography
The typography stack relies exclusively on **Inter**, ensuring crisp rendering and high legibility across screens of all sizes. The scale is structured to provide clear hierarchical contrast between dense data tables and prominent dashboard headings.

## Layout & Spacing
Using a standard fluid grid system with consistent gutters and scalable margins, the layout adapts smoothly across mobile, tablet, and desktop form factors. Spacing adheres to a predictable mathematical rhythm, ensuring balanced visual breathing room in dark mode compositions.

## Elevation & Depth
Depth is primarily achieved through **tonal layers** and subtle surface-container tiers rather than harsh drop shadows. In this dark mode system, elevated components lighten slightly against the background dark canvas to establish clear hierarchy.

## Shapes
The system uses a **rounded** shape profile (`roundedness: 2`). Standard UI elements feature a moderate 0.5rem corner radius, while larger containers scale up to 1rem and 1.5rem, creating an approachable, modern finish that softens the technical precision of the dark interface.

## Components
- **Buttons:** Solid primary buttons use the `#1275e2` background with high-contrast text, incorporating the system's rounded shape language.
- **Input Fields:** Outlined or filled inputs set against neutral dark surfaces, highlighting focused states with primary blue borders.
- **Cards & Containers:** Structured with subtle tonal elevation and rounded corners to segment complex data dashboards cleanly.
- **Chips & Badges:** Compact tagging elements utilizing secondary and tertiary accents for categorisation.