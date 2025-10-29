const baseConfig = require('./tailwind-base.config.js')
const path = require('path')

module.exports = {
    ...baseConfig,
    content: [
        // app + mock のパスを指定
        path.join(__dirname, '../../talk-mock/**/*.{js,ts,jsx,tsx,astro,html}'),
        path.join(
            __dirname,
            '../../talk-flash/**/*.{js,ts,jsx,tsx,astro,html}'
        ),
        // カスタムスタイル置き場
        path.join(__dirname, 'talk-custom-styles/**/*.css'),
        path.join(__dirname, 'common-custom-styles/**/*.css'),
    ],
}
