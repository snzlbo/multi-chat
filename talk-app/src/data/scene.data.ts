import type { Scene } from 'package/mock-components/astro-templates/Scene.type.ts'

export const Scenes: Scene[] = [
    {
        id: '1',
        state: 'normal',
        name: 'ホーム画面',
        url: '/home',
        description: 'ホーム画面',
    },
    {
        id: '2',
        state: 'normal',
        name: 'ペルソナ詳細画面',
        url: '/persona',
        description: 'ペルソナ詳細画面',
    },
    {
        id: '3',
        state: 'normal',
        name: 'トーク画面',
        url: '/talk',
        description: 'トーク画面',
    },
    {
        id: '4',
        state: 'normal',
        name: '新規ペルソナ登録画面',
        url: '/persona-register',
        description: '新規ペルソナ登録画面',
    },
    {
        id: '5',
        state: 'normal',
        name: '設定画面',
        url: '/setting',
        description: '設定画面',
    },
    {
        id: '6',
        state: 'normal',
        name: 'FAQ画面',
        url: '/faq',
        description: 'FAQ画面',
    },
    {
        id: '7',
        state: 'normal',
        name: 'オンボーディング',
        url: '/onboarding',
        description: 'オンボーディングが表示された状態',
    },
    {
        id: '8',
        state: 'normal',
        name: 'オンボーディング（必須スライドのみ）',
        url: '/onboarding-require',
        description:
            '「次回から表示しない」をチェック済みでオンボーディングが表示された状態',
    },
]

export const ScenesEn: Scene[] = [
    {
        id: '1',
        state: 'normal',
        name: 'ホーム画面',
        url: '/en/home',
        description: 'ホーム画面',
    },
    {
        id: '2',
        state: 'normal',
        name: 'ペルソナ詳細画面',
        url: '/en/persona',
        description: 'ペルソナ詳細画面',
    },
    {
        id: '3',
        state: 'normal',
        name: 'トーク画面',
        url: '/en/talk',
        description: 'トーク画面',
    },
    {
        id: '4',
        state: 'normal',
        name: '新規ペルソナ登録画面',
        url: '/en/persona-register',
        description: '新規ペルソナ登録画面',
    },
    {
        id: '5',
        state: 'normal',
        name: '設定画面',
        url: '/en/setting',
        description: '設定画面',
    },
    {
        id: '6',
        state: 'normal',
        name: 'FAQ画面',
        url: '/en/faq',
        description: 'FAQ画面',
    },
    {
        id: '7',
        state: 'normal',
        name: 'オンボーディング',
        url: '/en/onboarding',
        description: 'オンボーディングが表示された状態',
    },
    {
        id: '8',
        state: 'normal',
        name: 'オンボーディング（必須スライドのみ）',
        url: '/en/onboarding-require',
        description:
            '「次回から表示しない」をチェック済みでオンボーディングが表示された状態',
    },
]
