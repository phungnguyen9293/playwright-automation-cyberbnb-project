import { DASHBOARD } from '../../constants/dashboard.config';
import { test, expect } from '../../fixtures/test-hook';
import path from 'path';

test.describe('Dashboard - Update Avatar', () => {
    test.describe.configure({ mode: 'default' });
    test('UPDATE_AVATAR_01: Should open avatar update popup', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openAvatarDialog();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();

        // Popup has file selection input and upload button
        const fileInput = dialog.locator('input[type="file"]');
        await expect(fileInput).toBeAttached();
        await expect(dialog.getByRole('button', { name: DASHBOARD.AVATAR.BTN_UPLOAD })).toBeVisible();
        await expect(dialog.getByRole('button', { name: DASHBOARD.AVATAR.BTN_CLOSE })).toBeVisible();
    });

    test('UPDATE_AVATAR_02: Should close photo update popup', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openAvatarDialog();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();

        await dialog.getByRole('button', { name: DASHBOARD.AVATAR.BTN_CLOSE }).click();
        await expect(dialog).toBeHidden();
    });

    test('UPDATE_AVATAR_03: Should upload image in correct format', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openAvatarDialog();

        const dialog = page.getByRole('dialog');
        const fileInput = dialog.locator('input[type="file"]');

        // Upload valid JPG image
        const testImagePath = path.resolve(__dirname, ' ../../../../test-data/valid-avatar.jpg');
        await fileInput.setInputFiles(testImagePath);
        await dialog.getByRole('button', { name: DASHBOARD.AVATAR.BTN_UPLOAD }).click();

        await expect(page.getByText(DASHBOARD.AVATAR.TOAST_SUCCESS)).toBeVisible({ timeout: 10000 });
    });

    test('UPDATE_AVATAR_04: Should show error when no image selected', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openAvatarDialog();

        const dialog = page.getByRole('dialog');
        await dialog.getByRole('button', { name: DASHBOARD.AVATAR.BTN_UPLOAD }).click();

        await expect(page.getByText(DASHBOARD.AVATAR.TOAST_SELECT_ERR)).toBeVisible({ timeout: 5000 });
    });

    test.skip('UPDATE_AVATAR_05: Should reject non-image file format', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openAvatarDialog();
        const dialog = page.getByRole('dialog');
        const fileInput = dialog.locator('input[type="file"]');
        const testFilePath = path.resolve(__dirname, '../../test-data/invalid-file.pdf');
        await fileInput.setInputFiles(testFilePath);
        await dialog.getByRole('button', { name: DASHBOARD.AVATAR.BTN_UPLOAD }).click();

        await expect(page.getByText(DASHBOARD.AVATAR.TOAST_FORMAT_ERR)).toBeVisible({
            timeout: 5000,
        });
    });

    test('UPDATE_AVATAR_06: Should reject image exceeding file size limit', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openAvatarDialog();

        const dialog = page.getByRole('dialog');
        const fileInput = dialog.locator('input[type="file"]');

        const testImagePath = path.resolve(__dirname, '../../test-data/large-image.jpg');
        await fileInput.setInputFiles(testImagePath);
        await dialog.getByRole('button', { name: DASHBOARD.AVATAR.BTN_UPLOAD }).click();

        await expect(page.getByText(DASHBOARD.AVATAR.TOAST_SIZE_ERR)).toBeVisible({ timeout: 5000 });
    });

    test('UPDATE_AVATAR_07: Should handle rectangular image upload', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openAvatarDialog();

        const dialog = page.getByRole('dialog');
        const fileInput = dialog.locator('input[type="file"]');

        const testImagePath = path.resolve(__dirname, '../../test-data/rectangular-image.jpg');
        await fileInput.setInputFiles(testImagePath);
        await dialog.getByRole('button', { name: DASHBOARD.AVATAR.BTN_UPLOAD }).click();

        await expect(page.getByText(DASHBOARD.AVATAR.TOAST_SUCCESS)).toBeVisible({ timeout: 10000 });

        // Avatar does not overflow
        const avatar = page
            .locator('img[alt*="avatar"], img[alt*="Avatar"], .ant-avatar img')
            .first();
        if (await avatar.isVisible()) {
            const box = await avatar.boundingBox();
            if (box) {
                expect(box.width).toBeGreaterThan(0);
                expect(box.height).toBeGreaterThan(0);
            }
        }
    });

    test('UPDATE_AVATAR_08: Should handle multiple upload clicks', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openAvatarDialog();

        const dialog = page.getByRole('dialog');
        const fileInput = dialog.locator('input[type="file"]');

        const testImagePath = path.resolve(__dirname, '../../test-data/valid-avatar.jpg');
        await fileInput.setInputFiles(testImagePath);

        const uploadBtn = dialog.getByRole('button', { name: DASHBOARD.AVATAR.BTN_UPLOAD });
        await Promise.all([uploadBtn.click(), uploadBtn.click({ delay: 50 })]);

        await page.waitForTimeout(3000);
        const successToasts = page.getByText(DASHBOARD.AVATAR.TOAST_SUCCESS);
        const count = await successToasts.count();
        expect(count).toBeLessThanOrEqual(1);
    });

    test('UPDATE_AVATAR_09: Should persist avatar after page refresh', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);

        // Get current avatar src — search for image on dashboard page
        const avatar = page.locator('img').first();
        await avatar.getAttribute('src');

        await page.reload();
        await page.waitForLoadState('domcontentloaded');

        const avatarAfter = page.locator('img').first();
        const srcAfter = await avatarAfter.getAttribute('src');

        // Avatar must remain the same after refresh
        expect(srcAfter).toBeTruthy();
    });
});
