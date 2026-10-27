import { HOMEPAGE } from '../../constants/homePage.config';
import { test, expect } from '../../fixtures/test-hook';

test.describe.configure({ mode: 'default' });

test.describe('CyberBnB Login', () => {
    test('Should open login box', async ({ homePage, page }) => {
        await homePage.navigateToLogin();
        const loginDialog = page.getByRole('dialog');
        await expect(loginDialog).toBeVisible();

        await expect(loginDialog.getByRole('heading', { name: HOMEPAGE.LOGIN.HEADING })).toBeVisible();
        await expect(loginDialog.getByText(HOMEPAGE.LOGIN.EMAIL_LABEL, { exact: true }).first()).toBeVisible();
        await expect(page.getByPlaceholder(HOMEPAGE.LOGIN.EMAIL_PLACEHOLDER)).toBeVisible();

        await expect(loginDialog.getByText(HOMEPAGE.LOGIN.PASSWORD_LABEL, { exact: true }).first()).toBeVisible();
        await expect(page.getByPlaceholder(HOMEPAGE.LOGIN.PASSWORD_PLACEHOLDER)).toBeVisible();
        
        // Dialog has 2 buttons
        const btnRegister = page.getByRole('button', { name: HOMEPAGE.LOGIN.BTN_REGISTER });
        const btnLogin = page.getByRole('button', { name: HOMEPAGE.LOGIN.BTN_LOGIN });
        await expect(btnRegister).toBeVisible();
        await expect(btnLogin).toBeVisible();
    });

    test('Should login successfully', async ({ homePage, page }) => {
        const email = process.env.TEST_EMAIL!;
        const password = process.env.TEST_PASSWORD!;

        // 1. Perform login
        await homePage.login(email, password);

        // 2. User menu button appears with user name
        const userMenuButton = page.getByRole('button', { name: /Open user menu/i });
        await expect(userMenuButton).toBeVisible({ timeout: 10000 });

        // 3. User name displayed on navbar
        const userNameEnv = new RegExp(process.env.TEST_USER_NAME!, 'i');
        const userName = page
            .getByRole('navigation')
            .locator('span', { hasText: userNameEnv })
            .first();
        await expect(userName).toBeVisible();

        // 4. "Register" button (before login) is no longer visible
        await expect(page.locator('button.bg-main')).toBeHidden();

        // 5. Open dropdown menu and check options after login
        await userMenuButton.click();
        const dropdown = page.locator('#user-dropdown').filter({ hasNotText: HOMEPAGE.LOGIN.BTN_LOGIN });
        await expect(dropdown).toBeVisible();
        await expect(dropdown.getByText(HOMEPAGE.LOGIN.SIGN_OUT)).toBeVisible();
    });

    test('Should close login form with X button', async ({ homePage, page }) => {
        await homePage.navigateToLogin();
        const loginDialog = page.getByRole('dialog');
        await expect(loginDialog).toBeVisible();

        // Click X (Close) button to close dialog
        await loginDialog.getByRole('button', { name: 'Close' }).click();

        // Login dialog must be closed
        await expect(loginDialog).toBeHidden();
    });

    test('Should close login form by clicking outside popup', async ({ homePage, page }) => {
        await homePage.navigateToLogin();
        const loginDialog = page.getByRole('dialog');
        await expect(loginDialog).toBeVisible();
        await page.locator('.ant-modal-wrap').click({ position: { x: 10, y: 10 } });
        await page.waitForTimeout(500);

        // Dialog must be closed
        await expect(loginDialog).toBeHidden();
    });

    test('Should not login with empty email and password', async ({ homePage, page }) => {
        // 1. Open login dialog
        await homePage.navigateToLogin();
        const loginDialog = page.getByRole('dialog');
        await expect(loginDialog).toBeVisible();

        // 2. Do not enter anything, click Login directly
        await page.getByRole('button', { name: HOMEPAGE.LOGIN.BTN_LOGIN }).click();

        // 3. Show error message "Vui lòng không bỏ trống" for both Email and Password
        const errorMessages = loginDialog.getByText(HOMEPAGE.LOGIN.ERR_EMPTY);
        await expect(errorMessages).toHaveCount(2);

        // 4. Login dialog is still visible (no redirection)
        await expect(loginDialog).toBeVisible();

        // 5. User menu does not appear (not logged in yet)
        const userMenuButton = page.getByRole('button', { name: /Open user menu/i });
        await expect(userMenuButton).toBeHidden();
    });

    test('Should not login with wrong email', async ({ homePage, page }) => {
        // 1. Open dialog and enter wrong email + correct password
        await homePage.navigateToLogin();
        const loginDialog = page.getByRole('dialog');
        await expect(loginDialog).toBeVisible();

        await homePage.emailInput.fill('wrong_email@gmail.com');
        await homePage.passwordInput.fill(process.env.TEST_PASSWORD!);
        await page.getByRole('button', { name: HOMEPAGE.LOGIN.BTN_LOGIN }).click();

        // 2. Show error toast message
        await expect(page.getByText(HOMEPAGE.LOGIN.ERR_WRONG_CREDENTIALS)).toBeVisible({
            timeout: 5000,
        });

        // 3. Dialog is still open, login failed
        await expect(loginDialog).toBeVisible();
        const userMenuButton = page.getByRole('button', { name: /Open user menu/i });
        await expect(userMenuButton).toBeHidden();
    });

    test('Should not login with wrong password', async ({ homePage, page }) => {
        // 1. Open dialog and enter correct email + wrong password
        await homePage.navigateToLogin();
        const loginDialog = page.getByRole('dialog');
        await expect(loginDialog).toBeVisible();

        await homePage.emailInput.fill(process.env.TEST_EMAIL!);
        await homePage.passwordInput.fill('sai_mat_khau_123');
        await page.getByRole('button', { name: HOMEPAGE.LOGIN.BTN_LOGIN }).click();

        // 2. Show error toast message
        await expect(page.getByText(HOMEPAGE.LOGIN.ERR_WRONG_CREDENTIALS)).toBeVisible({
            timeout: 5000,
        });

        // 3. Dialog is still open, login failed
        await expect(loginDialog).toBeVisible();
        const userMenuButton = page.getByRole('button', { name: /Open user menu/i });
        await expect(userMenuButton).toBeHidden();
    });

    test('Should not login with invalid email format', async ({ homePage, page }) => {
        await homePage.navigateToLogin();
        const loginDialog = page.getByRole('dialog');
        await expect(loginDialog).toBeVisible();

        // 1. Enter invalid email format (no @)
        await homePage.emailInput.fill('emailkhonghople');
        await homePage.passwordInput.fill('123456');
        await page.getByRole('button', { name: HOMEPAGE.LOGIN.BTN_LOGIN }).click();

        // 2. Show email validation error
        await expect(loginDialog.getByText(HOMEPAGE.LOGIN.ERR_INVALID_EMAIL)).toBeVisible();

        // 3. Dialog is still open, login failed
        await expect(loginDialog).toBeVisible();
        const userMenuButton = page.getByRole('button', { name: /Open user menu/i });
        await expect(userMenuButton).toBeHidden();
    });

    test('Login form should not have password toggle icon', async ({ homePage, page }) => {
        await homePage.navigateToLogin();
        const loginDialog = page.getByRole('dialog');
        await expect(loginDialog).toBeVisible();

        await homePage.passwordInput.fill('MySecret123');

        // Login form has no eye icon
        const eyeIcon = loginDialog.locator('.anticon-eye-invisible, .anticon-eye');
        await expect(eyeIcon).toHaveCount(0);

        // Password is always hidden
        await expect(homePage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('Should show success toast on login', async ({ homePage, page }) => {
        await homePage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);

        // Toast "Đăng nhập thành công" must appear
        await expect(page.getByText(HOMEPAGE.LOGIN.TOAST_SUCCESS)).toBeVisible({ timeout: 5000 });
    });

    test('Should show success toast on logout', async ({ homePage, page }) => {
        // 1. Login first
        await homePage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);
        const userMenuButton = page.getByRole('button', { name: /Open user menu/i });
        await expect(userMenuButton).toBeVisible({ timeout: 10000 });

        // 2. Open dropdown and click Sign out
        await userMenuButton.click();
        const dropdown = page.locator('#user-dropdown').filter({ hasNotText: HOMEPAGE.LOGIN.BTN_LOGIN });
        await expect(dropdown).toBeVisible();
        await dropdown.getByText(HOMEPAGE.LOGIN.SIGN_OUT).click();

        // 3. Toast "Đăng xuất thành công" must appear
        await expect(page.getByText(HOMEPAGE.LOGIN.TOAST_LOGOUT)).toBeVisible({ timeout: 5000 });

        // 4. After logout: register button is visible again
        await expect(page.locator('button.bg-main')).toBeVisible({ timeout: 10000 });
    });

    test('Should logout from another page successfully', async ({ homePage, page }) => {
        // 1. Login
        await homePage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);
        const userMenuButton = page.getByRole('button', { name: /Open user menu/i });
        await expect(userMenuButton).toBeVisible({ timeout: 10000 });

        // 2. Go to another page
        await homePage.selectLocation('hcm');
        await page.waitForURL('**/rooms/ho-chi-minh**', { timeout: 30000 });

        // 3. Logout — wait for user menu to be ready on the new page
        await expect(userMenuButton).toBeVisible({ timeout: 15000 });
        await userMenuButton.click();
        const dropdown = page.locator('#user-dropdown').filter({ hasNotText: HOMEPAGE.LOGIN.BTN_LOGIN });
        await expect(dropdown).toBeVisible();
        await dropdown.getByText(HOMEPAGE.LOGIN.SIGN_OUT).click();

        // 4. Display toast logout successfully
        await expect(page.getByText(HOMEPAGE.LOGIN.TOAST_LOGOUT)).toBeVisible({ timeout: 5000 });

        // 5. Logged out state
        await expect(page.locator('button.bg-main')).toBeVisible({ timeout: 10000 });
    });
});
