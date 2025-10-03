/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use class strategy so toggling `html.dark` works
  darkMode: 'class',
  // Ensure Tailwind scans App Router files for classnames
  content: [
    './app/**/*.{js,jsx,ts,tsx,mdx}',
    './components/**/*.{js,jsx,ts,tsx,mdx}',
    './pages/**/*.{js,jsx,ts,tsx,mdx}',
  ],
}
