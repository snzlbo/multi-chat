// @ts-check
import { defineConfig, envField } from 'astro/config'
import React from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel'
import { fileURLToPath } from 'node:url'

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
    site: 'https://multi-chat-talk-app-git-main-snzlbos-projects.vercel.app/',
    adapter: vercel(),
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
            GEMINI_API_KEY: envField.string({
                context: 'client',
                access: 'public',
            }),
            FLASH_URL: envField.string({
                context: 'client',
                access: 'public',
            }),
            TALK_URL: envField.string({
                context: 'client',
                access: 'public',
            }),
            EXPERT_PASSWORD: envField.string({
                context: 'client',
                access: 'public',
            }),
        },
    },
})
