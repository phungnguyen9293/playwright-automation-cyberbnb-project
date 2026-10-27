import { expect, Locator, Page } from "@playwright/test";
import { HOMEPAGE } from "../constants/homePage.config";

export class HomePage {
    readonly page: Page;
    readonly avatarButton: Locator;
    readonly loginButton: Locator;
    readonly signUpButton: Locator;
    readonly hcmCard: Locator;
    readonly hanoiCard: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;

    // Header & Search Bar Locators
    readonly navbar: Locator;
    readonly logo: Locator;
    readonly locationLabel: Locator;
    readonly guestLabel: Locator;

    // Date Picker Locators
    readonly datePickerPopup: Locator;
    readonly staticRangeButtons: Locator;

    // Location Picker Locators
    readonly locationPickerTrigger: Locator;
    readonly locationPickerPopup: Locator;

    // Footer Locators
    readonly languageText: Locator;

    // Mobile Locators
    readonly mobileMenuToggle: Locator;

    // Room & Location Cards
    readonly roomCards: Locator;

    constructor(page: Page) {
        this.page = page;
        // 1. Locate the button containing the avatar image (used to open the dropdown menu)
        this.avatarButton = page.locator('button.bg-main');

        //2. Locate the Login/Register buttons inside the dropdown menu
        this.loginButton = page.locator('#user-dropdown').getByText(HOMEPAGE.LOGIN.BTN_LOGIN);
        this.signUpButton = page.locator('#user-dropdown').getByText(HOMEPAGE.LOGIN.BTN_REGISTER);

        // 3. Location cards
        this.hcmCard = page.locator('a[href*="ho-chi-minh"]');
        this.hanoiCard = page.locator('a[href*="ha-noi"]');

        // 4. Login form fields
        this.emailInput = page.getByPlaceholder(HOMEPAGE.LOGIN.EMAIL_PLACEHOLDER);
        this.passwordInput = page.getByPlaceholder(HOMEPAGE.LOGIN.PASSWORD_PLACEHOLDER);

        // Header & Search Bar
        this.navbar = page.getByRole('navigation');
        this.logo = page.getByAltText(/Cyber Logo/i);
        this.locationLabel = page.getByText(HOMEPAGE.SEARCH_BAR.LOCATION_LABEL);
        this.guestLabel = page.getByText(HOMEPAGE.SEARCH_BAR.GUEST_LABEL);

        // Date Picker
        this.datePickerPopup = page.locator('.rdrDateRangePickerWrapper');
        this.staticRangeButtons = this.datePickerPopup.locator('button.rdrStaticRange');

        // Location Picker
        this.locationPickerTrigger = page.getByText(HOMEPAGE.LOCATION_PICKER.PLACEHOLDER);
        this.locationPickerPopup = page.locator('div.absolute').filter({
            has: page.getByRole('heading', { name: HOMEPAGE.LOCATION_PICKER.TITLE }),
        });

        // Footer
        this.languageText = page.getByText(HOMEPAGE.FOOTER.LANGUAGE);

        // Mobile
        this.mobileMenuToggle = page.locator('button[data-collapse-toggle="navbar-user"]');

        // Room Cards
        this.roomCards = page.locator('[class*="card"], [class*="room"], [class*="listing"]');
    }

    async goto() {
        await this.page.goto(process.env.BASE_URL!, {
            waitUntil: 'domcontentloaded',
            timeout: 10000, // 10 seconds timeout
        });
    }

    async navigateToLogin() {
        await this.avatarButton.waitFor({ state: 'attached' });
        // Open menu then login
        await this.avatarButton.click();
        await this.loginButton.click();
    }

    async navigateToRegister() {
        await this.avatarButton.waitFor({ state: 'attached' });
        // Open menu then register
        await this.avatarButton.click();
        await this.signUpButton.click();
    }

    async signUp(data: {
        name: string;
        email: string;
        password: string;
        phone: string;
        birthday: string;
        gender: string;
    }) {
        await this.navigateToRegister();
        const dialog = this.page.getByRole('dialog');
        // Direct positioning by ID inside the dialog
        await dialog.locator('#name').fill(data.name);
        await dialog.locator('#email').fill(data.email);
        await dialog.locator('#password').fill(data.password);
        await dialog.locator('#phone').fill(data.phone);

        // Birthday — Ant Design DatePicker: type directly into input
        const birthdayInput = dialog.getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_BIRTHDAY);
        await birthdayInput.click();
        await birthdayInput.pressSequentially(data.birthday);
        await birthdayInput.press('Enter');

        // Gender — Ant Design Select: click to open dropdown, then select option
        await dialog.locator('.ant-select').click();
        const genderSelect = this.page.locator('.ant-select-dropdown:visible');
        await genderSelect.waitFor({ state: 'visible' });
        await genderSelect.getByText(data.gender, { exact: true }).click();

        await dialog.getByRole('button', { name: HOMEPAGE.LOGIN.BTN_REGISTER }).click();

    }

    async login(email: string, password: string) {
        await this.navigateToLogin();
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.page.getByRole('button', { name: HOMEPAGE.LOGIN.BTN_LOGIN }).click();
    }

    async selectLocation(city: 'hcm' | 'hanoi') {
        if (city === 'hcm') {
            await this.hcmCard.first().click();
        } else {
            await this.hanoiCard.first().click();
        }
    }

    async getLocationCard(city: 'hcm' | 'hanoi'): Promise<Locator> {
        return city === 'hcm' ? this.hcmCard.first() : this.hanoiCard.first();
    }

    // High-level Business Actions & Assertions

    async verifyHeaderStructure(filterList: string[], dateRangeRegex: RegExp) {
        await expect(this.navbar).toBeVisible();
        await expect(this.logo).toBeVisible();

        for (const filterName of filterList) {
            const button = this.page.getByRole('button', { name: filterName });
            await expect(button).toBeVisible();
            await expect(button).toBeEnabled();
        }

        await expect(this.locationLabel).toBeVisible();
        await expect(this.guestLabel).toBeVisible();
        await expect(this.page.getByText(dateRangeRegex)).toBeVisible();
    }

    async openDatePicker(dateRangeRegex: RegExp) {
        const dateTrigger = this.page.getByText(dateRangeRegex);
        await dateTrigger.click();
        await expect(this.datePickerPopup).toBeVisible();
    }

    async verifyStaticRanges(ranges: string[]) {
        for (const rangeLabel of ranges) {
            const rangeBtn = this.staticRangeButtons.filter({ hasText: rangeLabel });
            await expect(rangeBtn).toBeVisible();
            await expect(rangeBtn).toBeEnabled();
        }
    }

    async openLocationPicker() {
        await this.locationPickerTrigger.click();
        await expect(this.locationPickerPopup).toBeVisible();
    }

    async verifyLocationPickerData(locations: any[]) {
        if (locations.length > 0) {
            await expect(this.locationPickerPopup.getByText(locations[0].city, { exact: true })).toBeVisible({
                timeout: 10000,
            });
        }

        for (const loc of locations) {
            const cityCard = this.locationPickerPopup.locator('div.cursor-pointer').filter({
                hasText: new RegExp(`^${loc.city}$`, 'i'),
            });
            await expect(cityCard).toBeVisible();
            const cityImg = cityCard.locator('img');
            await expect(cityImg).toHaveAttribute('src', loc.image);
        }
    }

    async verifyLocationIntegrity(locations: any[]) {
        for (const loc of locations) {
            const card = this.page
                .locator('a')
                .filter({
                    hasText: loc.city,
                })
                .first();

            await expect(card).toBeVisible({ timeout: 7000 });
            await expect(card.locator('img')).toBeVisible();
        }
    }

    async verifyFooterStructure(footerData: any) {
        await this.page.getByText(footerData.COPYRIGHT_ANCHOR).scrollIntoViewIfNeeded();

        for (const section of footerData.SECTIONS) {
            const column = this.page
                .locator('div')
                .filter({
                    has: this.page.getByRole('heading', { name: section.TITLE }),
                })
                .first();

            await expect(column.getByRole('heading', { name: section.TITLE })).toBeVisible();

            for (const linkText of section.LINKS) {
                const link = column.getByRole('link', { name: linkText, exact: true });
                await link.scrollIntoViewIfNeeded();
                await expect(link).toBeVisible({ timeout: 5000 });
                await expect(link).toHaveAttribute('href', /.*/);
            }
        }
        await expect(this.languageText).toBeVisible();
    }

    async verifyMobileLayout() {
        await this.page.setViewportSize({ width: 390, height: 844 });
        await this.page.waitForTimeout(500);
        await expect(this.mobileMenuToggle).toBeVisible();
    }
}
