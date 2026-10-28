# 🚀 CyberBnB Automation Test Project

An automation testing framework built for the **CyberBnB** platform, powered by **Playwright Test** and **TypeScript**. This project implements advanced testing architectural patterns including the Page Object Model (POM), Custom Fixtures, and integrates an AI Agent for automated code refactoring.

---

## 👥 Authors & Contributors

This project is actively developed and maintained by:

- **NGUYEN TRUONG PHI PHUNG** — Lead Automation Test Engineer
- **Claude** — Core AI Assistant & Code Architect
- **Aider** — AI Pair Programming Agent (Powered by Gemini)

---

## 🛠️ Tech Stack

- **Core Framework:** [Playwright](https://playwright.dev/) (v1.60+)
- **Language:** TypeScript
- **Test Reporter:** Allure Playwright & Monocart Reporter
- **Code Formatter:** Prettier
- **AI Copilot (Pair Programming):** Aider Chat (Powered by Gemini 1.5 Flash/Pro)

---

## 📁 Project Directory Structure

```text
cyberbnb-test/
├── .github/
│   └── workflows/
│       └── playwright.yml # GitHub Actions CI/CD workflow configuration
├── constants/             # Manages constant variables, endpoints, and centralized text configurations
├── fixtures/              # Defines Custom Fixtures (Test Hooks, automated Page initialization)
├── pages/                 # Implements Page Object Model (POM) to manage Selectors and Actions per page
│   └── homepage.ts        # Example: POM file for the Homepage
├── tests/                 # Root directory containing all test case files (.spec.ts)
│   ├── booking/           # Test suites related to the room booking workflows
│   ├── dashboard/         # Test suites related to the user management dashboard
│   └── homepage/          # Test suites covering homepage UI components and core functionalities
├── CONVENTIONS.md         # Official coding conventions and guidelines for the project
├── playwright.config.ts   # Core configurations for Playwright (Timeouts, Retries, Browsers...)
└── package.json           # Manages project dependencies and execution scripts
```

## 📊 Test Reporting (Allure Report)

The project utilizes Allure Playwright to generate interactive and graphical test insights.

1. Prerequisite Configuration
   Ensure that the Allure reporter is enabled in your playwright.config.ts:

```TypeScript
reporter: [
        ['line'],
        ['allure-playwright', { outputFolder: 'allure-results' }]
    ]
```

2. Generate and View Report Locally
   Run your automation test suite to gather test results, then execute the following command to spin up the local Allure server:

```Bash
# Serves the HTML report on a local port and opens it in your default browser
npx allure-commandline serve allure-results
```
