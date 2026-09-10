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
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
---

# Design System - Fidelity Dark System

## Brand & Style
The design system adopts a **Corporate / Modern** aesthetic tailored for a dark color mode environment (`dark`). It projects reliability, technical precision, and professional efficiency, utilizing the **Inter** typeface across all hierarchy levels for clean, highly legible typography. Visual elements favor a balanced, approachable roundedness level (`2`), bridging the gap between clinical utility and modern ergonomics.

## Colors
The color system is built for a dark mode environment, leveraging high-fidelity semantic derivations to ensure clear contrast and visual hierarchy.
- **Primary (`#1275e2`)**: The core brand color, used for primary actions, active states, and key interactive focal points.
- **Secondary (`#5f78a3`)**: A muted blue-gray supporting color used for secondary actions, borders, and structural accents.
- **Tertiary (`#c55b00`)**: A warm amber accent color used for highlights, warnings, or specialized callouts.
- **Neutral (`#74777f`)**: A balanced slate-neutral utilized for backgrounds, surfaces, and text hierarchies to reduce eye strain in dark interfaces.

## Typography
The typography system relies exclusively on **Inter**, ensuring a neutral, highly readable geometric sans-serif aesthetic across headlines, body copy, and labels. Font weights and scales are calibrated for high information density and legibility in dark mode.

## Layout & Spacing
A structured layout philosophy using standard gutters (`1rem`) and outer margins (`1.5rem`). Spacing scales linearly to maintain comfortable breathing room across dense data tables, forms, and analytical dashboards.

## Elevation & Depth
Depth is primarily conveyed through tonal surface layering against the dark background, reinforced by low-contrast outlines and subtle ambient glows to separate interactive layers without relying on heavy drop shadows.

## Shapes
The roundedness factor is set to `2`, giving UI containers, buttons, and cards a moderately rounded corner radius (0.5rem standard, scaling up to 1rem for large cards). This softens the starkness of the dark interface while maintaining a modern, professional structure.

## Components
- **Buttons:** Styled with primary (`#1275e2`) or secondary (`#5f78a3`) fills, incorporating a moderate corner radius (`roundedness: 2`).
- **Cards & Surfaces:** Built on dark neutral foundations (`#74777f` tinted surfaces) with soft boundary definitions.
- **Inputs & Controls:** Clear focus states using the primary brand blue for active input borders and toggles.