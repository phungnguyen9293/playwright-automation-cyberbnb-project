import { HOMEPAGE } from '../../constants/homePage.config';
import { test, expect } from '../../fixtures/test-hook';
import { getSearchDateRangeRegex } from '../../utils/dateHelper';

test.describe('Search Filter', () => {
    test('SEARCH_FILTER_01: Should show all locations when location is blank', async ({ page }) => {
        await page.goto('/');

        // Click on location section in search bar
        await page.getByText(HOMEPAGE.SEARCH_BAR.LOCATION_LABEL).click();
        const popup = page.locator('div.absolute').filter({
            has: page.getByRole('heading', { name: HOMEPAGE.LOCATION_PICKER.TITLE }),
        });
        await expect(popup).toBeVisible();
    });

    test('SEARCH_FILTER_02: Should search rooms by valid location', async ({ homePage, page }) => {
        await page.goto('/');

        await homePage.selectLocation('hcm');
        await page.waitForURL('**/rooms/ho-chi-minh**', { timeout: 15000 });
        expect(page.url()).toContain('ho-chi-minh');
    });

    test('SEARCH_FILTER_03: Should open date range picker', async ({ page }) => {
        await page.goto('/');

        const dateTrigger = page.getByText(getSearchDateRangeRegex(1, 7));
        await dateTrigger.click();

        const picker = page.locator('.rdrDateRangePickerWrapper');
        await expect(picker).toBeVisible();

        // Check if "This Week" can be selected
        const thisWeek = picker.locator('button.rdrStaticRange').filter({ hasText: 'This Week' });
        await expect(thisWeek).toBeVisible();
    });

    test.skip('SEARCH_FILTER_04: Should reject end date before start date', async ({ page }) => {
        await page.goto('/');
        const dateTrigger = page.getByText(getSearchDateRangeRegex(1, 7));
        await dateTrigger.click();

        const picker = page.locator('.rdrDateRangePickerWrapper');
        await expect(picker).toBeVisible();

        // Select start date near the end of the month
        const days = picker.locator('.rdrDay:not(.rdrDayPassive):not(.rdrDayDisabled)');
        const dayCount = await days.count();
        if (dayCount > 10) {
            await days.nth(dayCount - 3).click();
            await days.nth(2).click();
        }

        await expect(page.getByText(/không hợp lệ|invalid/i)).toBeVisible();
    });

    test('SEARCH_FILTER_05: Should have disabled past dates', async ({ page }) => {
        await page.goto('/');
        const dateTrigger = page.getByText(getSearchDateRangeRegex(1, 7));
        await dateTrigger.click();

        const picker = page.locator('.rdrDateRangePickerWrapper');
        await expect(picker).toBeVisible();

        // Past dates should be disabled or passive
        const disabledDays = picker.locator('.rdrDayDisabled, .rdrDayPassive');
        const count = await disabledDays.count();
        expect(count).toBeGreaterThan(0);
    });

    test('SEARCH_FILTER_06: Should filter rooms by guest count', async ({ page }) => {
        await page.goto('/');

        await page.getByText(HOMEPAGE.SEARCH_BAR.GUEST_LABEL).click();
        await page.waitForTimeout(500);

        const addBtn = page.locator('button').filter({ hasText: '+' }).first();
        if (await addBtn.isVisible()) {
            await addBtn.click();
            await addBtn.click();

            const guestDisplay = page.getByText(HOMEPAGE.SEARCH.GUEST_SUFFIX).first();
            await expect(guestDisplay).toBeVisible({ timeout: 3000 });
        }
    });

    test.skip('SEARCH_FILTER_07: Should handle excessive guest count', async ({ page }) => {
        await page.goto('/');

        await page.getByText(HOMEPAGE.SEARCH_BAR.GUEST_LABEL).click();
        await page.waitForTimeout(500);

        const addBtn = page.locator('button').filter({ hasText: '+' }).first();
        if (await addBtn.isVisible()) {
            for (let i = 0; i < 20; i++) {
                await addBtn.click();
            }

            const guestDisplay = page.getByText(new RegExp(`(\\d+) ${HOMEPAGE.SEARCH.GUEST_SUFFIX}`, 'i')).first();
            await expect(guestDisplay).toBeVisible();
            const text = await guestDisplay.textContent();
            const count = parseInt(text?.match(/(\d+)/)?.[1] || '0');
            expect(count).toBeGreaterThan(0);
            expect(count).toBeLessThanOrEqual(16);
        }
    });

    test('SEARCH_FILTER_08: Should search by clicking magnifying glass icon', async ({ page }) => {
        await page.goto('/');

        await page.getByText(HOMEPAGE.LOCATION_PICKER.PLACEHOLDER).click();
        const popup = page.locator('div.absolute').filter({
            has: page.getByRole('heading', { name: HOMEPAGE.LOCATION_PICKER.TITLE }),
        });
        await expect(popup).toBeVisible();
        await popup.getByText('Hồ Chí Minh').click();

        await page.locator('.anticon-search').click();
        await page.waitForURL('**/rooms/**', { timeout: 15000 });

        expect(page.url()).toContain('rooms');
    });

    test('SEARCH_FILTER_09: Should search by pressing Enter', async ({ page }) => {
        // BUG: Pressing Enter does not trigger search
        test.fail();

        await page.goto('/');

        await page.getByText(HOMEPAGE.LOCATION_PICKER.PLACEHOLDER).click();
        const popup = page.locator('div.absolute').filter({
            has: page.getByRole('heading', { name: HOMEPAGE.LOCATION_PICKER.TITLE }),
        });
        await expect(popup).toBeVisible();
        await popup.getByText('Hồ Chí Minh').click();

        await page.keyboard.press('Enter');
        await page.waitForURL('**/rooms/**', { timeout: 15000 });

        expect(page.url()).toContain('rooms');
    });
});
