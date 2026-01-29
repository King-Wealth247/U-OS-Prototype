export const theme = {
    colors: {
        // Primary Brand
        primary: '#002147', // Deep Royal Blue
        primaryLight: '#003366',
        primaryDark: '#00152e',

        // Accents
        accent: '#FFD700', // Gold
        secondaryAccent: '#4A90E2', // Electric Blue (for actionable items)

        // Semantic
        success: '#2ECC71',
        error: '#E74C3C',
        warning: '#F1C40F',
        info: '#3498DB',

        // Backgrounds (Dark Mode preference for premium feel)
        background: '#0F172A', // Very dark blue/slate
        surface: 'rgba(255, 255, 255, 0.1)', // Glass effect base
        surfaceHighlight: 'rgba(255, 255, 255, 0.15)',

        // Text
        textPrimary: '#FFFFFF',
        textSecondary: 'rgba(255, 255, 255, 0.7)',
        textMuted: 'rgba(255, 255, 255, 0.5)',
        textInverse: '#1A1A1A',

        // Borders
        border: 'rgba(255, 255, 255, 0.1)',
        borderHighlight: 'rgba(255, 255, 255, 0.3)',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    typography: {
        h1: { fontSize: 32, fontWeight: '700', letterSpacing: 0.5 },
        h2: { fontSize: 24, fontWeight: '700', letterSpacing: 0.3 },
        h3: { fontSize: 20, fontWeight: '600' },
        body: { fontSize: 16, lineHeight: 24 },
        caption: { fontSize: 12, lineHeight: 16, color: 'rgba(255,255,255,0.6)' },
        button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
    },
    borderRadius: {
        sm: 8,
        md: 16,
        lg: 24,
        xl: 100, // Capsule
    },
    shadows: {
        soft: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        },
        glow: {
            shadowColor: '#4A90E2',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 6,
        }
    }
};

export type Theme = typeof theme;
