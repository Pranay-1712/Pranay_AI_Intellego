import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				hogwarts: {
					red: '#740001',     // Gryffindor Red
					gold: '#D3A625',    // Gryffindor Gold
					blue: '#0E1A40',    // Ravenclaw Blue
					bronze: '#946B2D',  // Ravenclaw Bronze
					yellow: '#FFD800',  // Hufflepuff Yellow
					black: '#000000',   // Hufflepuff Black
					green: '#1A472A',   // Slytherin Green
					silver: '#5D5D5D',  // Slytherin Silver
					parchment: '#F5F0E1', // Parchment color
					purple: '#5e0e7b',  // Wizard Purple
					teal: '#006364',    // Magical Teal
					bright: '#f5c542'   // Magical Gold
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'quill-writing': {
					'0%': { transform: 'translateX(0px) translateY(0px) rotate(0deg)' },
					'25%': { transform: 'translateX(2px) translateY(-1px) rotate(1deg)' },
					'50%': { transform: 'translateX(-1px) translateY(1px) rotate(-0.5deg)' },
					'75%': { transform: 'translateX(3px) translateY(-2px) rotate(1.5deg)' },
					'100%': { transform: 'translateX(0px) translateY(0px) rotate(0deg)' }
				},
				float: {
					'0%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' },
					'100%': { transform: 'translateY(0px)' },
				},
				'float-rotate': {
					'0%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-15px) rotate(5deg)' },
					'100%': { transform: 'translateY(0px) rotate(0deg)' },
				},
				twinkle: {
					'0%, 100%': { opacity: '0.1', boxShadow: '0 0 0 rgba(255, 255, 255, 0)' },
					'50%': { opacity: '1', boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.7)' },
				},
				'magic-bubble': {
					'0%': { transform: 'scale(0.7)', opacity: '0.3' },
					'50%': { transform: 'scale(1.1)', opacity: '1' },
					'100%': { transform: 'scale(0.7)', opacity: '0.3' },
				},
				'magic-wave': {
					'0%': { opacity: '0', transform: 'translateX(-10px)' },
					'50%': { opacity: '0.7' },
					'100%': { opacity: '0', transform: 'translateX(10px)' },
				},
				flicker: {
					'0%, 100%': { opacity: '1', boxShadow: '0 0 8px 2px rgba(255, 191, 0, 0.8)' },
					'50%': { opacity: '0.6', boxShadow: '0 0 4px 1px rgba(255, 191, 0, 0.4)' },
				},
				'float-candle': {
					'0%, 100%': { transform: 'translateY(0) rotate(1deg)' },
					'50%': { transform: 'translateY(-10px) rotate(-1deg)' },
				},
				'float-magical': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg) scale(1)' },
					'33%': { transform: 'translateY(-12px) rotate(2deg) scale(1.02)' },
					'66%': { transform: 'translateY(-5px) rotate(-1deg) scale(0.98)' },
				},
				'magical-glow': {
					'0%, 100%': { textShadow: '0 0 5px rgba(245, 197, 66, 0.7)' },
					'50%': { textShadow: '0 0 15px rgba(245, 197, 66, 0.9), 0 0 20px rgba(245, 197, 66, 0.4)' },
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				'border-rotate': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				'spell-cast': {
					'0%': { transform: 'scale(0)', opacity: '0' },
					'50%': { transform: 'scale(1.2)', opacity: '0.8' },
					'100%': { transform: 'scale(1.5)', opacity: '0' },
				},
				'spell-glow': {
					'0%': { boxShadow: '0 0 5px rgba(245, 197, 66, 0.4)' },
					'50%': { boxShadow: '0 0 15px rgba(245, 197, 66, 0.8), 0 0 30px rgba(245, 197, 66, 0.4)' },
					'100%': { boxShadow: '0 0 5px rgba(245, 197, 66, 0.4)' },
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				'spin-reverse': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(-360deg)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'quill-writing': 'quill-writing 1.5s ease-in-out infinite',
				"float": "float 6s ease-in-out infinite",
				"float-slow": "float 8s ease-in-out infinite",
				"float-slower": "float 10s ease-in-out infinite",
				"float-rotate": "float-rotate 7s ease-in-out infinite",
				"twinkle": "twinkle 2s ease-in-out infinite",
				"twinkle-delayed": "twinkle 2s ease-in-out 0.7s infinite",
				"twinkle-slow": "twinkle 3s ease-in-out 1.5s infinite",
				"magic-bubble": "magic-bubble 1.5s ease-in-out infinite",
				"magic-wave": "magic-wave 2s ease-in-out infinite",
				"flicker": "flicker 0.5s ease-in-out infinite",
				"flicker-delayed": "flicker 0.6s ease-in-out 0.2s infinite",
				"flicker-slow": "flicker 0.8s ease-in-out 0.4s infinite",
				"float-candle": "float-candle 4s ease-in-out infinite",
				"float-candle-slow": "float-candle 6s ease-in-out 1s infinite",
				"float-candle-slower": "float-candle 7s ease-in-out 2s infinite",
				"float-magical": "float-magical 8s ease-in-out infinite",
				"magical-glow": "magical-glow 3s ease-in-out infinite",
				"scale-in": "scale-in 0.3s ease-out forwards",
				"scale-in-delayed": "scale-in 0.3s ease-out 0.1s forwards",
				"border-rotate": "border-rotate 4s linear infinite",
				"spell-cast": "spell-cast 2s ease-out forwards",
				"spell-glow": "spell-glow 2s ease-in-out infinite",
				"spin-slow": "spin-slow 8s linear infinite",
				"spin-reverse": "spin-reverse 12s linear infinite",
			},
			backgroundImage: {
				'parchment': "url('/parchment.png')"
			},
			fontFamily: {
				'magical': ['"Harry Potter"', 'serif'],
				'serif': ['Georgia', 'serif']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
