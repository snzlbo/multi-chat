const baseConfig = require('./tailwind-base.config.js');
const path = require('path');

module.exports = {
  ...baseConfig,
  content: [
    // path.join(__dirname, '../../flash-app/**/*.{js,ts,jsx,tsx,astro,html}'),
    path.join(__dirname, '../../flash-mock/**/*.{js,ts,jsx,tsx,astro,html}'),
    path.join(__dirname, 'flash-custom-styles/**/*.css'),
    path.join(__dirname, 'common-custom-styles/**/*.css'),
  ],
};
