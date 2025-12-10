/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                medical: {
                    safe: '#10B981', // Emerald 500
                    infectious: '#EF4444', // Red 500
                    blocked: '#F59E0B', // Amber 500
                    glass: 'rgba(255, 255, 255, 0.7)',
                }
            },
            animation: {
                'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
