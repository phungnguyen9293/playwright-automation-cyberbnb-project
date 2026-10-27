import { HOMEPAGE } from '../../constants/homePage.config';
import { test, expect } from '../../fixtures/test-hook';
import { Page, Locator } from '@playwright/test';

async function fillRegistrationForm(
    dialog: Locator,
    page: Page,
    overrides: Partial<{
        name: string;
        email: string;
        password: string;
        phone: string;
        birthday: string;
        gender: string;
    }> = {}
) {
    const data = {
        name: 'Test User',
        email: `test${Date.now()}@gmail.com`,
        password: 'Test@12345',
        phone: '0901234567',
        birthday: '15/06/1995',
        gender: 'Nam',
        ...overrides,
    };

    await dialog.getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_NAME).first().fill(data.name);
    await dialog.getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_NAME).last().fill(data.email);
    await dialog.getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_PASSWORD).fill(data.password);
    await dialog.getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_PHONE).fill(data.phone);

    const birthdayInput = dialog.getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_BIRTHDAY);
    await birthdayInput.click();
    await birthdayInput.pressSequentially(data.birthday);
    await birthdayInput.press('Enter');

    await dialog.locator('.ant-select').click();
    const genderDropdown = page.locator('.ant-select-dropdown:visible');
    await genderDropdown.waitFor({ state: 'visible' });
    await genderDropdown.getByText(data.gender, { exact: true }).click();
}

test.describe('CyberBnB Register', () => {
    test('Should open signup box', async ({ homePage, page }) => {
        await homePage.navigateToRegister();
        const signUpDialog = page.getByRole('dialog');
        await expect(signUpDialog.getByRole('heading', { name: HOMEPAGE.REGISTER.HEADING })).toBeVisible();
    });

    test('Should register successfully', async ({ homePage, page }) => {
        const randomId = Date.now();

        const signUpData = {
            name: `Test User ${randomId}`,
            email: `testuser${randomId}@gmail.com`,
            password: 'Test@12345',
            phone: '0901234567',
            birthday: '15/06/1995',
            gender: 'Nam',
        };

        // 1. Fill the form and submit
        await homePage.signUp(signUpData);

        // 2. Toast "Đăng ký thành công" appears
        await expect(page.getByText(HOMEPAGE.REGISTER.TOAST_SUCCESS)).toBeVisible({ timeout: 10000 });

        // 3. After successful registration, the website automatically opens the Login dialog
        const loginDialog = page.getByRole('dialog').filter({
            has: page.getByRole('heading', { name: HOMEPAGE.LOGIN.HEADING }),
        });
        await expect(loginDialog).toBeVisible({ timeout: 5000 });
    });

    test('Should close register form with X button', async ({ homePage, page }) => {
        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('heading', { name: HOMEPAGE.REGISTER.HEADING })).toBeVisible();

        // Click X (Close) button to close the dialog
        await dialog.getByRole('button', { name: 'Close' }).click();

        // The signup dialog must be closed
        await expect(dialog).toBeHidden();
    });

    test('Should close register form by clicking outside popup', async ({ homePage, page }) => {
        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('heading', { name: HOMEPAGE.REGISTER.HEADING })).toBeVisible();
        await page.locator('.ant-modal-wrap').click({ position: { x: 10, y: 10 } });

        // The dialog must be closed
        await expect(dialog).toBeHidden();
    });

    test('Should not register with all fields empty', async ({ homePage, page }) => {
        // 1. Open the register dialog
        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('heading', { name: HOMEPAGE.REGISTER.HEADING_ACCOUNT })).toBeVisible();

        // 2. Do not fill anything, click Register directly
        await dialog.getByRole('button', { name: HOMEPAGE.REGISTER.HEADING }).click();

        // 3. Display error "Vui lòng không bỏ trống" for Name, Email, Password, Phone
        const emptyErrors = dialog.getByText(HOMEPAGE.LOGIN.ERR_EMPTY);
        await expect(emptyErrors).toHaveCount(4);

        // 4. Display specific error for Birthday
        await expect(dialog.getByText(HOMEPAGE.REGISTER.ERR_BIRTHDAY_EMPTY)).toBeVisible();

        // 5. Dialog is still visible, registration failed
        await expect(dialog.getByRole('heading', { name: HOMEPAGE.REGISTER.HEADING_ACCOUNT })).toBeVisible();

        // 6. Success toast is not visible
        await expect(page.getByText(HOMEPAGE.REGISTER.TOAST_SUCCESS)).toBeHidden();
    });

    test('Should show error when only Name is filled', async ({ homePage, page }) => {
        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');

        // Only fill Name, leave other fields empty
        await dialog.getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_NAME).first().fill('Test User');
        await dialog.getByRole('button', { name: HOMEPAGE.REGISTER.HEADING }).click();

        // Email, Password, Phone still report empty errors
        const emptyErrors = dialog.getByText(HOMEPAGE.LOGIN.ERR_EMPTY);
        await expect(emptyErrors).toHaveCount(3);

        // Birthday still reports error
        await expect(dialog.getByText(HOMEPAGE.REGISTER.ERR_BIRTHDAY_EMPTY)).toBeVisible();

        // Registration failed
        await expect(page.getByText(HOMEPAGE.REGISTER.TOAST_SUCCESS)).toBeHidden();
    });

    test('Should show error when only Email is filled', async ({ homePage, page }) => {
        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');

        // Only fill Email
        await dialog.getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_NAME).last().fill('test@gmail.com');
        await dialog.getByRole('button', { name: HOMEPAGE.REGISTER.HEADING }).click();

        // Name, Password, Phone still report empty errors
        const emptyErrors = dialog.getByText(HOMEPAGE.LOGIN.ERR_EMPTY);
        await expect(emptyErrors).toHaveCount(3);

        // Birthday still reports error
        await expect(dialog.getByText(HOMEPAGE.REGISTER.ERR_BIRTHDAY_EMPTY)).toBeVisible();

        await expect(page.getByText(HOMEPAGE.REGISTER.TOAST_SUCCESS)).toBeHidden();
    });

    test('Should show error when Birthday is missing', async ({ homePage, page }) => {
        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');

        // Fill all 4 text fields, leave Birthday empty
        await dialog.getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_NAME).first().fill('Test User');
        await dialog
            .getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_NAME)
            .last()
            .fill(`test${Date.now()}@gmail.com`);
        await dialog.getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_PASSWORD).fill('Test@12345');
        await dialog.getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_PHONE).fill('0901234567');
        await dialog.getByRole('button', { name: HOMEPAGE.REGISTER.HEADING }).click();

        // No more "Vui lòng không bỏ trống" errors
        await expect(dialog.getByText(HOMEPAGE.LOGIN.ERR_EMPTY)).toHaveCount(0);

        // Only Birthday error remains
        await expect(dialog.getByText(HOMEPAGE.REGISTER.ERR_BIRTHDAY_EMPTY)).toBeVisible();

        // Registration failed
        await expect(page.getByText(HOMEPAGE.REGISTER.TOAST_SUCCESS)).toBeHidden();
    });

    test('Should not register with password under 6 characters', async ({ homePage, page }) => {
        // BUG: Web allows registration with password < 6 characters (no validation)
        test.fail();

        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('heading', { name: HOMEPAGE.REGISTER.HEADING_ACCOUNT })).toBeVisible();

        await fillRegistrationForm(dialog, page, { password: '12345' });

        // Capture API response on registration click
        const [response] = await Promise.all([
            page.waitForResponse((res) => res.url().includes('/auth/signup')),
            dialog.getByRole('button', { name: HOMEPAGE.REGISTER.HEADING }).click(),
        ]);

        // Server should reject registration with password < 6 characters
        expect(response.status()).not.toBe(200);
    });

    test('Should not register with letters in phone number', async ({ homePage, page }) => {
        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');

        await fillRegistrationForm(dialog, page, { phone: 'abc7658345' });
        await dialog.getByRole('button', { name: HOMEPAGE.REGISTER.HEADING }).click();

        // Show "Số điện thoại không hợp lệ" error
        await expect(dialog.getByText(HOMEPAGE.REGISTER.ERR_PHONE_INVALID)).toBeVisible();
        await expect(page.getByText(HOMEPAGE.REGISTER.TOAST_SUCCESS)).toBeHidden();
    });

    test('Should not register with incorrect phone number length', async ({ homePage, page }) => {
        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');

        await fillRegistrationForm(dialog, page, { phone: '9864' });
        await dialog.getByRole('button', { name: HOMEPAGE.REGISTER.HEADING }).click();

        // Show "Số điện thoại không hợp lệ" error
        await expect(dialog.getByText(HOMEPAGE.REGISTER.ERR_PHONE_INVALID)).toBeVisible();
        await expect(page.getByText(HOMEPAGE.REGISTER.TOAST_SUCCESS)).toBeHidden();
    });

    test('Should not register with future date of birth', async ({ homePage, page }) => {
        // BUG: Web allows future birthday and registers successfully
        test.fail();

        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('heading', { name: HOMEPAGE.REGISTER.HEADING_ACCOUNT })).toBeVisible();

        await fillRegistrationForm(dialog, page, { birthday: '15/06/2030' });

        // Capture API response on registration click
        const [response] = await Promise.all([
            page.waitForResponse((res) => res.url().includes('/auth/signup')),
            dialog.getByRole('button', { name: HOMEPAGE.REGISTER.HEADING }).click(),
        ]);

        // Server should reject registration with future birthday
        expect(response.status()).not.toBe(200);
    });

    test('Should not register with invalid email format', async ({ homePage, page }) => {
        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');

        await fillRegistrationForm(dialog, page, { email: 'emailsaidinhdang' });
        await dialog.getByRole('button', { name: HOMEPAGE.REGISTER.HEADING }).click();

        await expect(dialog.getByText(HOMEPAGE.LOGIN.ERR_INVALID_EMAIL)).toBeVisible();
        await expect(dialog.getByRole('heading', { name: HOMEPAGE.REGISTER.HEADING_ACCOUNT })).toBeVisible();
        await expect(page.getByText(HOMEPAGE.REGISTER.TOAST_SUCCESS)).toBeHidden();
    });

    test('Should not register with existing email', async ({ homePage, page }) => {
        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');

        await fillRegistrationForm(dialog, page, { email: process.env.TEST_EMAIL! });
        await dialog.getByRole('button', { name: HOMEPAGE.REGISTER.HEADING }).click();

        // Show error toast for existing email
        await expect(page.getByText(HOMEPAGE.REGISTER.ERR_EMAIL_EXISTS)).toBeVisible({ timeout: 5000 });

        // Dialog remains open, registration failed
        await expect(dialog.getByRole('heading', { name: HOMEPAGE.REGISTER.HEADING_ACCOUNT })).toBeVisible();
        await expect(page.getByText(HOMEPAGE.REGISTER.TOAST_SUCCESS)).toBeHidden();
    });

    test('Should toggle password visibility with eye icon', async ({ homePage, page }) => {
        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('heading', { name: HOMEPAGE.REGISTER.HEADING_ACCOUNT })).toBeVisible();

        // Fill password
        const passwordInput = dialog.getByPlaceholder(HOMEPAGE.REGISTER.PLACEHOLDER_PASSWORD);
        await passwordInput.fill('MySecret123');

        // 1. Default: type="password" → password is hidden
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // 2. Click eye icon → type is "text" → show password
        const eyeIcon = dialog.locator('.ant-input-password-icon');
        await eyeIcon.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // 3. Click again → type back to "password" → hide password again
        await eyeIcon.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('Should not create duplicate account when clicking register multiple times', async ({
        homePage,
        page,
    }) => {
        await homePage.navigateToRegister();
        const dialog = page.getByRole('dialog');
        const randomId = Date.now();
        const dupEmail = `dupuser${randomId}@gmail.com`;

        await fillRegistrationForm(dialog, page, {
            name: `Dup User ${randomId}`,
            email: dupEmail,
        });

        // Click Register button multiple times (spam click)
        const registerBtn = dialog.getByRole('button', { name: HOMEPAGE.REGISTER.HEADING });
        await Promise.all([
            registerBtn.click(),
            registerBtn.click({ delay: 50 }),
            registerBtn.click({ delay: 100 }),
        ]);

        await page.waitForTimeout(3000);

        const successToasts = page.getByText(HOMEPAGE.REGISTER.TOAST_SUCCESS);
        const successCount = await successToasts.count();
        expect(successCount).toBe(1);

        const duplicateToast = page.getByText(HOMEPAGE.REGISTER.ERR_EMAIL_EXISTS);
        await expect(duplicateToast).toBeHidden();

        // Retry registering with the same email → must show duplicate error
        await page.reload();
        await homePage.navigateToRegister();
        const dialog2 = page.getByRole('dialog');

        await fillRegistrationForm(dialog2, page, {
            name: `Dup User ${randomId}`,
            email: dupEmail,
        });
        await dialog2.getByRole('button', { name: HOMEPAGE.REGISTER.HEADING }).click();

        await expect(page.getByText(HOMEPAGE.REGISTER.ERR_EMAIL_EXISTS)).toBeVisible({ timeout: 5000 });
    });
});
