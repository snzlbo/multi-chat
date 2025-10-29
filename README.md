# aiqqq-sharepoint

このリポジトリは、複数アプリケーションを含む **モノレポ** 形式で構成されています。  
Node.js および Yarn の特定バージョンを用いて開発する想定です。

## 1. 環境構築

### Node.js

- バージョン: **22.14.0**
- [Node Version Manager](https://github.com/nvm-sh/nvm)

### Yarn

- バージョン: **4.6.0**


## 2. プロジェクト構成

このモノレポには以下のアプリケーションが含まれます:
```
├─ flash-app/
├─ flash-mock/
├─ talk-app/
└─ talk-mock/
```

それぞれのアプリで `yarn install` 後、ビルド・起動できます。  
トップレベルにも `package.json` があり、Yarn Workspaces を利用しています。

スタイルおよび汎用的に使用するReactコンポーネント等は以下のディレクトリで開発します。
```
packages/
├─ config/ ... tsconfig, prettier.config.js など汎用設定ファイルの格納場所。（適宜利用してください）
├─ hooks ... FLASH、TALK共通で使用するフック
├─ mock-component/ ... FLASH、TALK共通で使用するモック用Reactコンポーネント
└─ styles/ ... tailwindcssの設定ファイルとカスタムスタイル
``` 


## 3. モックの構成

### 概要
- 目標
  - デザイン・UI・UXを確認するためのマルチページの静的サイトを生成する。
  - アプリケーション本体の実装メンバーへ、画面レイアウトやHTML構造・アニメーション等を提供する。
- 利用技術:
  - React … 各ページで使用するコンポーネント
  - Astrojs … モックアップをマルチページの静的サイトとしてビルド
  - nanostores … モックアップ内での状態管理に使用

### ディレクトリ構成
```
/talk-mock(flash-mock)
├─ public/
│   └─ ... (静的に配信するアセットを格納予定)
├─ src/
│   ├─ assets/        // メディアファイル (画像)
│   ├─ components/    // Reactコンポーネント (.tsx)
│   ├─ data/          // ダミーデータ、モックアップ画面一覧リスト
│   ├─ layouts/       // Astroのレイアウトファイル
│   ├─ pages/         // モックアップ画面。
│   │   ├─ index.astro  // モックアップ画面一覧
│   │   ├─ home/        // Home画面
│   │   ├─ faq/         // FAQ画面
│   │   ├─ setting/     // Setting画面
│   │   └─ ...
│   ├─ store/         // 状態管理（nanostoresを利用）
│   └─ types/         // 汎用的に利用する型ファイル
├─ package.json
└─ ...
```