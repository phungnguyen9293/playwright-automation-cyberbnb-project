import { DASHBOARD } from '../constants//dashboard.config';
import { HOMEPAGE } from '../constants/homePage.config';
import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly editProfileButton: Locator;
    readonly updatePhotoButton: Locator;
    readonly profileDialog: Locator;
    readonly avatarDialog: Locator;
    readonly emailInput: Locator;
    readonly nameInput: Locator;
    readonly phoneInput: Locator;
    readonly birthdayInput: Locator;
    readonly genderSelect: Locator;
    readonly updateButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.editProfileButton = page.getByRole('button', { name: DASHBOARD.PROFILE.HEADING_EDIT });
        this.updatePhotoButton = page.getByRole('button', { name: DASHBOARD.AVATAR.BTN_UPDATE_PHOTO });
        this.profileDialog = page.getByRole('dialog');
        this.avatarDialog = page.getByRole('dialog');
        this.emailInput = page.getByRole('dialog').locator('#email');
        this.nameInput = page.getByRole('dialog').locator('#name');
        this.phoneInput = page.getByRole('dialog').locator('#phone');
        this.birthdayInput = page.getByRole('dialog').locator('#birthday');
        this.genderSelect = page.getByRole('dialog').locator('.ant-select');
        this.updateButton = page.getByRole('dialog').getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE });
    }

    async loginAndGotoDashboard(homePage: {
        login: (email: string, password: string) => Promise<void>;
    }) {
        await homePage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);
        const userMenuButton = this.page.getByRole('button', { name: /Open user menu/i });
        await userMenuButton.waitFor({ state: 'visible', timeout: 10000 });
        await userMenuButton.click();
        const dropdown = this.page.locator('#user-dropdown').filter({ hasNotText: HOMEPAGE.LOGIN.BTN_LOGIN });
        await dropdown.waitFor({ state: 'visible' });
        await dropdown.getByText('Dashboard').click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async openProfileDialog() {
        await this.editProfileButton.click();
        await this.profileDialog.waitFor({ state: 'visible' });
    }

    async openAvatarDialog() {
        await this.updatePhotoButton.click();
        await this.avatarDialog.waitFor({ state: 'visible' });
    }
}
