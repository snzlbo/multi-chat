// @ts-check
import { defineConfig, envField } from 'astro/config'
import React from '@astrojs/react'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
    integrations: [
        React(),
        tailwind({
            configFile: '../package/styles/tailwind-talk.config.js',
        }),
    ],
    devToolbar: {
        enabled: false,
    },
    site: 'https://esq365.sharepoint.com/sites/dd-AIQQQ-TALK-dev/Style%20Library',
    build: {
        assetsPrefix:
            'https://esq365.sharepoint.com/sites/dd-AIQQQ-TALK-dev/Style%20Library',
    },
    env: {
        schema: {
            ENV: envField.string({
                context: 'client',
                access: 'public',
            }),
            OPENAI_API_KEY: envField.string({
                context: 'client',
                access: 'public',
            }),
        },
    },
})
