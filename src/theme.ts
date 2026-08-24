import { createTheme } from '@mui/material/styles'

/**
 * "Paper and ink" — SALAS / martevi design tokens, ported into an MUI theme.
 *
 * Distilled from the working prototype at `../salas/salas.html`. Keep this
 * in sync with the project's design-system documentation if a token value
 * changes on either side.
 *
 * Seven colors, two type families, one easing curve. Resist adding an
 * eighth color or a third font before checking whether an existing token
 * already covers the case.
 */

const paper = '#F4F1EA'
const paper2 = '#EBE6DB'
const paper3 = '#DED8CA'
const ink = '#17130E'
const ink2 = '#4A4238'
const ink3 = '#8C8375'
const line = 'rgba(23,19,14,.16)'
const lineSoft = 'rgba(23,19,14,.08)'
const accent = '#A8442A' // terracotta
const accent2 = '#C98A3E' // ochre — companion accent, reserved for dark grounds

const serif = '"Instrument Serif","Times New Roman",Times,serif'
const sans = '"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif'
const ease = 'cubic-bezier(.66,0,.25,1)'

// Custom palette keys beyond MUI's built-ins (paper3, ink3, lineSoft, accent2
// don't map cleanly onto primary/secondary/text.*, so they're exposed
// directly on the theme instead of overloading a semantic slot that means
// something else in MUI's own components).
declare module '@mui/material/styles' {
  interface Palette {
    paper2: string
    paper3: string
    ink3: string
    lineSoft: string
    accent2: string
  }
  interface PaletteOptions {
    paper2?: string
    paper3?: string
    ink3?: string
    lineSoft?: string
    accent2?: string
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: paper, paper: paper2 },
    text: { primary: ink, secondary: ink2, disabled: ink3 },
    divider: line,
    primary: { main: accent, contrastText: paper },
    secondary: { main: accent2, contrastText: ink },
    paper2,
    paper3,
    ink3,
    lineSoft,
    accent2,
  },

  typography: {
    fontFamily: sans,
    fontWeightLight: 300,
    // Serif, weight 400, is for anything that "speaks" — every heading.
    h1: { fontFamily: serif, fontWeight: 400, lineHeight: 0.94, letterSpacing: '-.03em' },
    h2: { fontFamily: serif, fontWeight: 400, lineHeight: 1.0, letterSpacing: '-.022em' },
    h3: { fontFamily: serif, fontWeight: 400, lineHeight: 1.04, letterSpacing: '-.015em' },
    h4: { fontFamily: serif, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-.012em' },
    h5: { fontFamily: serif, fontWeight: 400, lineHeight: 1.14 },
    h6: { fontFamily: serif, fontWeight: 400, lineHeight: 1.2 },
    // Sans, weight 300, for everything functional.
    body1: { fontFamily: sans, fontWeight: 300, lineHeight: 1.78, color: ink2 },
    body2: { fontFamily: sans, fontWeight: 300, lineHeight: 1.72, color: ink2 },
    subtitle1: { fontFamily: serif, fontWeight: 400, lineHeight: 1.14 },
    subtitle2: { fontFamily: sans, fontWeight: 300, color: ink2 },
    // The site's recurring "micro-label" / eyebrow pattern: small, wide
    // tracking, uppercase, quiet by default.
    overline: {
      fontFamily: sans,
      fontWeight: 300,
      fontSize: '10px',
      letterSpacing: '.18em',
      color: ink3,
      lineHeight: 1.6,
    },
    caption: {
      fontFamily: sans,
      fontWeight: 300,
      fontSize: '10.5px',
      letterSpacing: '.1em',
      color: ink3,
    },
    button: {
      fontFamily: sans,
      fontWeight: 300,
      fontSize: '10.5px',
      letterSpacing: '.18em',
      textTransform: 'uppercase',
    },
  },

  // Motion is one curve everywhere, slow — nothing on this site snaps.
  transitions: {
    easing: {
      easeInOut: ease,
      easeOut: ease,
      easeIn: ease,
      sharp: ease,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '::selection': { backgroundColor: accent, color: paper },
        ':focus-visible': { outline: `2px solid ${accent}`, outlineOffset: '3px' },
        body: { backgroundColor: paper, color: ink },
      },
    },
    // Structure comes from hairlines, not elevation — flatten the
    // shadow-based components and give them a 1px border instead.
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none', border: `1px solid ${line}` },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'transparent' },
      styleOverrides: {
        root: {
          backgroundColor: paper,
          color: ink,
          borderBottom: `1px solid ${line}`,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: `1px solid ${line}`, backgroundImage: 'none' },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: line } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        // `.btn.cheio` / `.btn.vazio` from salas.html: a filled rectangle
        // that hovers from ink to accent, and an outline that inverts to
        // filled ink on hover. Keyed on ownerState rather than the old
        // `containedPrimary`/`outlinedPrimary` classKeys.
        root: ({ ownerState }) => ({
          minHeight: 44,
          ...(ownerState.variant === 'contained' &&
            ownerState.color === 'primary' && {
              backgroundColor: ink,
              color: paper,
              '&:hover': { backgroundColor: accent },
            }),
          ...(ownerState.variant === 'outlined' &&
            ownerState.color === 'primary' && {
              borderColor: ink,
              color: ink,
              '&:hover': { backgroundColor: ink, color: paper, borderColor: ink },
            }),
        }),
      },
    },
  },
})
