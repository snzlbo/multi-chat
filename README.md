# CHATBOT MICRO-INTERVENTIONS FOR MENTAL WELL BEING

It is intended to be developed using specific versions of Node.js and Yarn.

## 1. Environment Setup

### Node.js

- **Version**: **22.14.0**
- [Node Version Manager](https://github.com/nvm-sh/nvm)

### Yarn

- **Version**: **4.6.0**

## 2. Project Structure

This monorepo includes the following applications:

```
├─ package/
└─ talk-app/
```

After running `yarn install` in each app, you can build and run it.
There is also a `package.json` at the top level, which uses Yarn Workspaces.

Styles and general-purpose React components are developed in the following directory:

```
packages/
├─ config/ ... Location for general-purpose configuration files like tsconfig, prettier.config.js, etc. (Use as needed)
├─ hooks ... Hooks
├─ mock-component/ ... React components for mocks used TALK-APP
└─ styles/ ... Tailwind CSS configuration files and custom styles
```

## 3. Mock Structure

### Overview

- **Goal**
  - Generate a multi-page static site to review the design, UI, and UX.
  - Provide screen layouts, HTML structure, animations, etc., to the implementation members of the main application.
- **Technologies Used**:
  - **React** … Components used on each page
  - **Astrojs** … Builds the mockup as a multi-page static site
  - **nanostores** … Used for state management within the mockup

### Directory Structure

```
/talk-mock(flash-mock)
├─ public/
│   └─ ... (For storing assets to be served statically)
├─ src/
│   ├─ assets/        // Media files (images)
│   ├─ components/    // React components (.tsx)
│   ├─ data/          // Dummy data, list of mockup screens
│   ├─ layouts/       // Astro layout files
│   ├─ pages/         // Mockup screens.
│   │   ├─ index.astro  // List of mockup screens
│   │   ├─ home/        // Home screen
│   │   ├─ faq/         // FAQ screen
│   │   ├─ setting/     // Setting screen
│   │   └─ ...
│   ├─ store/         // State management (using nanostores)
│   └─ types/         // General-purpose type files
├─ package.json
└─ ...
```