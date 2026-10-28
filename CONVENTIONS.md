# Playwright Automation Test Suite - AI Agent Conventions

You are an Quality Assurance Engineer working on the **cyberbnb-test** automation platform. You must strictly adhere to the project topology, environment rules, and scripting constraints detailed below for every file modification or test case creation.

---

## 📂 Project Architecture Map

When adding features, selectors, or test scenarios, you must strictly maintain the existing Page Object Model (POM) setup:

- **`tests/homepage/`**: Test spec execution suites (`.spec.ts`).
- **`pages/`**: UI Elements, selectors, and user action wrappers (e.g., `HomePage.ts`).
- **`constants/`**: Environment configurations, path utilities, and test data blocks (`booking.config.ts`, `homePage.config.ts`).
- **`fixtures/`**: Test setup routines and custom pipeline custom lifecycle hooks (`test-hook.ts`).
- **`utils/`**: Shared functional tools and date processing algorithms (`dateHelper.ts`).

---

## 🔑 Absolute Rules for AI Agent (Strict Enforcement)

### 1. Target Engine Limitation

- **Chromium Only**: This project is locked exclusively to Google Chrome automation setups. Do NOT uncomment or add target execution pipelines for `firefox`, `webkit`, or generic mobile viewports inside `playwright.config.ts`.

### 2. Strict Environment Variable Guardrails

- **Hardcoding is Forbidden**: Credentials, access keys, tokens, or direct base endpoints must never be typed directly into code strings within the `tests/` directory.
- **Resolution Strategy**: Always extract dynamic variables cleanly through `process.env.*` (such as `process.env.BASE_URL`).

### 3. Git & Integrity Management (Allure & Playwright Reports)

- **Artifact Isolation**: Test execution results and static HTML summaries change constantly. Never allow tracking, staging, or committing the following directories:
    - `allure-results/`
    - `playwright-report/`
    - `test-results/`
- Ensure these directories are perfectly filtered inside `.gitignore`.

### 4. Flaky Test Mitigation & Code Patterns

- **Locator Hygiene**: Leverage strong, resilient Playwright modern locators (e.g., `page.getByRole`, `page.getByText`, or specialized dynamic custom data attributes). Avoid flaky, long-chained absolute XPaths.
- **Asynchronous Flow**: Ensure every action command (`click()`, `fill()`, `goto()`) and assertion matchers (`expect().toBeVisible()`) are fully bound to the `await` statement runtime sequence.

---

## 🔍 Pre-Flight Checklist Before Tasks Closure

Before outputting code or claiming a ticket/prompt is resolved, you must ensure:

1. New locators or interactions are properly embedded into the corresponding Page Object inside `pages/` rather than mixed inside `.spec.ts` files.
2. The compilation passes flawlessly under strict TypeScript rules mapping to `tsconfig.json`.
3. The git commit message matches standard semantics, explicitly scoped (e.g., `test(homepage): add core criteria validation for static date-picker ranges`).
