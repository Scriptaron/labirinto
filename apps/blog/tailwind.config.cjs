/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [
        require('../../packages/tailwind-config')
    ],
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
};
