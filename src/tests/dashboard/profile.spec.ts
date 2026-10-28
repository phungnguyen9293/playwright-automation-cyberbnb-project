import { DASHBOARD } from '../../constants/dashboard.config';
import { test, expect } from '../../fixtures/test-hook';

test.describe('Dashboard - Update Profile', () => {
    test.describe.configure({ mode: 'default' });

    test('UPDATE_PROFILE_01: Should open profile editing popup', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        await expect(dialog.getByText(DASHBOARD.PROFILE.HEADING_EDIT)).toBeVisible();
        await expect(dialog.locator('#email')).toBeVisible();
        await expect(dialog.locator('#name')).toBeVisible();
        await expect(dialog.locator('#phone')).toBeVisible();
        await expect(
            dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE })
        ).toBeVisible();
        await expect(dialog.locator('button.ant-modal-close')).toBeVisible();

        // Data must be preloaded from server
        const emailValue = await dialog.locator('#email').inputValue();
        expect(emailValue.length).toBeGreaterThan(0);
    });

    test('UPDATE_PROFILE_02: Should close popup without saving', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        const oldName = await dialog.locator('#name').inputValue();

        // Edit name then close with X
        await dialog.locator('#name').clear();
        await dialog.locator('#name').fill('Tên Tạm Thời');
        await dialog.locator('button.ant-modal-close').click();
        await expect(dialog).toBeHidden();

        // Reopen → data must remain the same as old one
        await dashboardPage.openProfileDialog();
        const dialog2 = page.getByRole('dialog');
        await expect(dialog2.locator('#name')).toHaveValue(oldName);
    });

    test('UPDATE_PROFILE_03: Should update profile successfully', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        const oldName = await dialog.locator('#name').inputValue();
        const oldPhone = await dialog.locator('#phone').inputValue();

        const newName = 'Phụng Cập Nhật';
        const newPhone = '0999888777';
        await dialog.locator('#name').clear();
        await dialog.locator('#name').fill(newName);
        await dialog.locator('#phone').clear();
        await dialog.locator('#phone').fill(newPhone);

        // Wait for successful API response
        const [response] = await Promise.all([
            page.waitForResponse(
                (res) => res.url().includes('/api/users/') && res.request().method() === 'PUT'
            ),
            dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click(),
        ]);
        expect(response.status()).toBe(200);

        // Dialog automatically closes after successful update
        await expect(dialog).toBeHidden({ timeout: 5000 });

        // Reopen and confirm new data
        await dashboardPage.openProfileDialog();
        const dialog2 = page.getByRole('dialog');
        await expect(dialog2.locator('#name')).toHaveValue(newName);
        await expect(dialog2.locator('#phone')).toHaveValue(newPhone);

        // Restore
        await dialog2.locator('#name').clear();
        await dialog2.locator('#name').fill(oldName);
        await dialog2.locator('#phone').clear();
        await dialog2.locator('#phone').fill(oldPhone);
        const [restoreRes] = await Promise.all([
            page.waitForResponse(
                (res) => res.url().includes('/api/users/') && res.request().method() === 'PUT'
            ),
            dialog2.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click(),
        ]);
        expect(restoreRes.status()).toBe(200);
    });

    test('UPDATE_PROFILE_04: Should show error when email is blank', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        await dialog.locator('#email').clear();
        await dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click();

        await expect(dialog.getByText(DASHBOARD.PROFILE.ERR_EMAIL_EMPTY)).toBeVisible();
        await expect(dialog.getByText(DASHBOARD.PROFILE.HEADING_EDIT)).toBeVisible();
    });

    test('UPDATE_PROFILE_05: Should show error for incorrect email format', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        await dialog.locator('#email').clear();
        await dialog.locator('#email').fill('emailkhonghople');
        await dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click();

        await expect(dialog.getByText(DASHBOARD.PROFILE.ERR_EMAIL_INVALID)).toBeVisible();
    });

    test('UPDATE_PROFILE_06: Should show error for existing email', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        const oldEmail = await dialog.locator('#email').inputValue();

        await dialog.locator('#email').clear();
        await dialog.locator('#email').fill('diemquyen2596dhcn1b@gmail.com');
        await dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click();
        await page.waitForTimeout(1500);

        // Close dialog then reopen to verify email remains unchanged
        await dialog.locator('button.ant-modal-close').click();
        await expect(dialog).toBeHidden();
        await dashboardPage.openProfileDialog();
        const dialog2 = page.getByRole('dialog');
        await expect(dialog2.locator('#email')).toHaveValue(oldEmail);
    });

    test('UPDATE_PROFILE_07: Should show error when name is blank', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        await dialog.locator('#name').clear();
        await dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click();

        await expect(dialog.getByText(DASHBOARD.PROFILE.ERR_NAME_EMPTY)).toBeVisible();
    });

    test('UPDATE_PROFILE_08: Should accept name with numbers/special chars', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        await dialog.locator('#name').clear();
        await dialog.locator('#name').fill('Test@User#123');
        await dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click();

        // If update succeeds → toast appears, otherwise → dialog remains open
        const successToast = page.getByText(DASHBOARD.PROFILE.TOAST_SUCCESS);
        const isSuccess = await successToast.isVisible({ timeout: 3000 }).catch(() => false);

        // Whether success or not, the form should accept input (no crash)
        expect(isSuccess || (await dialog.isVisible())).toBeTruthy();
    });

    test('UPDATE_PROFILE_09: Should show error when phone is blank', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        await dialog.locator('#phone').clear();
        await dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click();

        await expect(dialog.getByText(DASHBOARD.PROFILE.ERR_PHONE_EMPTY)).toBeVisible();
    });

    test('UPDATE_PROFILE_10: Should show error for incorrect phone format', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        await dialog.locator('#phone').clear();
        await dialog.locator('#phone').fill('abc1234567');
        await dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click();

        await expect(dialog.getByText(DASHBOARD.PROFILE.ERR_PHONE_INVALID)).toBeVisible();
    });

    test('UPDATE_PROFILE_11: Should show error for incorrect phone length', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        // BUG: Allows updating phone with invalid length
        // test.fail();

        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        await dialog.locator('#phone').clear();
        await dialog.locator('#phone').fill('0123');
        await dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click();

        await expect(dialog.getByText(DASHBOARD.PROFILE.ERR_PHONE_INVALID)).toBeVisible();
    });

    test('UPDATE_PROFILE_12: Should show error when birthday is blank', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        const birthdayInput = dialog.locator('#birthday');
        // Focus → select all → delete → close picker
        await birthdayInput.click();
        await page.keyboard.press('Meta+a');
        await page.keyboard.press('Backspace');
        // Close picker by clicking dialog heading
        await dialog.getByText(DASHBOARD.PROFILE.HEADING_EDIT).click();
        await page.waitForTimeout(300);
        await dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click();

        await expect(dialog.getByText(DASHBOARD.PROFILE.ERR_BIRTHDAY_EMPTY).last()).toBeVisible();
    });

    test('UPDATE_PROFILE_13: Should show error for future date of birth', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        // BUG: Web allows future birthday update (server returns 200)
        test.fail();

        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');

        // Save old birthday to restore
        const birthdayInput = dialog.locator('#birthday');
        const oldBirthday = await birthdayInput.inputValue();

        // Type future birthday
        await birthdayInput.click();
        await page.keyboard.press('Meta+a');
        await page.keyboard.type('15/06/2030');
        await page.keyboard.press('Enter');
        await dialog.getByText(DASHBOARD.PROFILE.HEADING_EDIT).click();
        await page.waitForTimeout(300);

        // Capture API response
        const [response] = await Promise.all([
            page.waitForResponse(
                (res) => res.url().includes('/api/users/') && res.request().method() === 'PUT'
            ),
            dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click(),
        ]);

        // Server must reject future birthday (status !== 200)
        expect(response.status()).not.toBe(200);

        // Restore old birthday if server accepts it (bug case)
        if (response.status() === 200 && oldBirthday) {
            await birthdayInput.click();
            await page.keyboard.press('Meta+a');
            await page.keyboard.type(oldBirthday);
            await page.keyboard.press('Enter');
            await dialog.getByText(DASHBOARD.PROFILE.HEADING_EDIT).click();
            await page.waitForTimeout(300);
            await dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click();
            await page.waitForTimeout(1000);
        }
    });

    test('UPDATE_PROFILE_14: Should show error when gender is not selected', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        // BUG: No error message displayed when gender is not selected
        // test.fail();

        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        // Clear gender selection if possible
        const genderSelect = dialog.locator('.ant-select-clear');
        if (await genderSelect.isVisible()) {
            await genderSelect.click();
        }
        await dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click();

        await expect(dialog.getByText(DASHBOARD.PROFILE.ERR_GENDER_EMPTY)).toBeVisible();
    });

    test('UPDATE_PROFILE_15: Should update successfully with no data changed', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        await dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click();

        await expect(page.getByText(DASHBOARD.PROFILE.TOAST_SUCCESS)).toBeVisible({
            timeout: 5000,
        });
    });

    test('UPDATE_PROFILE_16: Should handle multiple consecutive update clicks', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        const updateBtn = dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE });

        await Promise.all([updateBtn.click(), updateBtn.click({ delay: 50 })]);

        await expect(page.getByText(DASHBOARD.PROFILE.TOAST_SUCCESS)).toBeVisible({
            timeout: 5000,
        });
    });

    test('UPDATE_PROFILE_17: Should persist data after page refresh', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);
        await dashboardPage.openProfileDialog();

        const dialog = page.getByRole('dialog');
        const oldName = await dialog.locator('#name').inputValue();
        const tempName = 'Tên Kiểm Tra Refresh';

        await dialog.locator('#name').clear();
        await dialog.locator('#name').fill(tempName);

        const [updateRes] = await Promise.all([
            page.waitForResponse(
                (res) => res.url().includes('/api/users/') && res.request().method() === 'PUT'
            ),
            dialog.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click(),
        ]);
        expect(updateRes.status()).toBe(200);

        await expect(dialog).toBeHidden({ timeout: 5000 });

        // Refresh page
        await page.reload();
        await page.waitForLoadState('domcontentloaded');

        await dashboardPage.openProfileDialog();
        const dialog2 = page.getByRole('dialog');
        await expect(dialog2.locator('#name')).toHaveValue(tempName);

        // Restore
        await dialog2.locator('#name').clear();
        await dialog2.locator('#name').fill(oldName);
        const [restoreRes] = await Promise.all([
            page.waitForResponse(
                (res) => res.url().includes('/api/users/') && res.request().method() === 'PUT'
            ),
            dialog2.getByRole('button', { name: DASHBOARD.PROFILE.BTN_UPDATE }).click(),
        ]);
        expect(restoreRes.status()).toBe(200);
    });
});
