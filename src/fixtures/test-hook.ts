import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { DashboardPage } from '../pages/Dashboard';

type MyFixtures = {
    homePage: HomePage;
    dashboardPage: DashboardPage;
};

export const test = base.extend<MyFixtures>({
    homePage: async ({ page }, use) => {
        const homePage = new HomePage(page);
        await homePage.goto();
        await use(homePage);
    },
    dashboardPage: async ({ page }, use) => {
        const dashboardPage = new DashboardPage(page);
        await use(dashboardPage);
    },
});

export { expect } from '@playwright/test';