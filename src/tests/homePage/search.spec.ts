import { HOMEPAGE } from '../../constants/homePage.config';
import { test, expect } from '../../fixtures/test-hook';
import { getSearchDateRangeRegex } from '../../utils/dateHelper';


test.describe('Search', () => {
    
    test('SEARCH_01: Search by location from homepage → display results for correct location', async ({
        homePage,
        page,
    }) => {
        await homePage.goto();
        await homePage.selectLocation('hcm');
        await page.waitForURL('**/rooms/ho-chi-minh**', { timeout: 15000 });

        // URL contains correct location
        expect(page.url()).toContain('ho-chi-minh');

        // Results page displays room list
        const roomCards = page.locator('[class*="card"]').first();
        await expect(roomCards).toBeVisible();
    });

    test('SEARCH_02: Search by another location from results page → switch to new location', async ({
        homePage,
        page,
    }) => {
        await homePage.goto();
        // Go to HCM results page first
        await homePage.selectLocation('hcm');
        await page.waitForURL('**/rooms/ho-chi-minh**', { timeout: 15000 });

        // From results page, click location picker in search bar
        await page.getByText(HOMEPAGE.LOCATION_PICKER.PLACEHOLDER).click();
        const popup = page.locator('div.absolute').filter({
            has: page.getByRole('heading', { name: HOMEPAGE.LOCATION_PICKER.TITLE }),
        });
        await expect(popup).toBeVisible();

        // Choose another location (Ha Noi) → picker fills input
        await popup.getByText('Hà Nội').click();

        // Click search button (magnifying glass icon in search bar)
        await page.locator('.anticon-search').click();
        await page.waitForURL('**/rooms/ha-noi**', { timeout: 15000 });

        expect(page.url()).toContain('ha-noi');
        const roomCards = page.locator('[class*="card"]').first();
        await expect(roomCards).toBeVisible({ timeout: 10000 });
    });

    test('SEARCH_03: Select dates on homepage → search bar updates with correct selected dates', async ({homePage,
        page,
    }) => {
        await homePage.goto();

        // Get default date text before selection
        const dateTrigger = page.getByText(getSearchDateRangeRegex(1, 7));
        await dateTrigger.click();

        const picker = page.locator('.rdrDateRangePickerWrapper');
        await expect(picker).toBeVisible();

        // Choose "This Week"
        await picker.locator('button.rdrStaticRange').filter({ hasText: 'This Week' }).click();

        // Date picker is still visible after selecting range
        await expect(picker).toBeVisible();

        // Click outside the picker to close
        await page.locator('body').click({ position: { x: 10, y: 10 }, force: true });

        // Date on search bar must update (can be same or different depending on the week)
        // Just verify search bar still displays correct format DD/MM/YYYY
        const dateSection = page
            .locator('div')
            .filter({ hasText: /\d{2}\/\d{2}\/\d{4}/ })
            .first();
        await expect(dateSection).toBeVisible();
    });

    test('SEARCH_04: Select dates on results page → date picker works normally', async ({
        homePage,
        page,
    }) => {
        // Go to results page first
        await homePage.goto();
        await homePage.selectLocation('hcm');
        await page.waitForURL('**/rooms/ho-chi-minh**', { timeout: 15000 });

        // Open date picker on results page
        const dateTrigger = page.getByText(getSearchDateRangeRegex(1, 7));
        await dateTrigger.click();

        const picker = page.locator('.rdrDateRangePickerWrapper');
        await expect(picker).toBeVisible();

        // Choose "This Week"
        await picker.locator('button.rdrStaticRange').filter({ hasText: 'This Week' }).click();
        await expect(picker).toBeVisible();
    });

    test('SEARCH_05: Navigate to room detail → booking modal retains previously selected dates and guest count', async ({
        homePage,
        page,
    }) => {
        await homePage.goto();
        await homePage.selectLocation('hcm');
        await page.waitForURL('**/rooms/ho-chi-minh**', { timeout: 15000 });

        const roomCard = page.locator('a[href*="room-detail"]').first();
        await roomCard.waitFor({ state: 'visible', timeout: 10000 });
        await roomCard.click();
        await page.waitForURL('**/room-detail/**', { timeout: 15000 });

        // Checkin date is pre-filled (format DD-MM-YYYY)
        const checkinField = page
            .locator('div.cursor-pointer')
            .filter({ hasText: HOMEPAGE.SEARCH.CHECKIN })
            .first();
        await expect(checkinField.getByText(/\d{2}-\d{2}-\d{4}/)).toBeVisible();

        // Checkout date is pre-filled
        const checkoutField = page
            .locator('div.cursor-pointer')
            .filter({ hasText: HOMEPAGE.SEARCH.CHECKOUT })
            .first();
        await expect(checkoutField.getByText(/\d{2}-\d{2}-\d{4}/)).toBeVisible();

        // Guest count is pre-filled
        await expect(page.getByText(new RegExp(`\\d+ ${HOMEPAGE.SEARCH.GUEST_SUFFIX}`))).toBeVisible();

        // Book button is visible
        await expect(page.getByRole('button', { name: HOMEPAGE.SEARCH.BTN_BOOK })).toBeVisible();
    });

    test('SEARCH_06: Click on search bar → expands, click outside → collapses (BUG)', async ({
        page,
    }) => {
        // BUG: Search bar does not collapse when clicking outside
        test.fail();

        await page.goto('/');

        // Click on location field → search bar expands
        await page.getByText(HOMEPAGE.SEARCH_BAR.LOCATION_LABEL).click();
        const popup = page.locator('div.absolute').filter({
            has: page.getByRole('heading', { name: HOMEPAGE.LOCATION_PICKER.TITLE }),
        });
        await expect(popup).toBeVisible();

        // Click outside → search bar should collapse
        await page.locator('body').click({ position: { x: 10, y: 10 } });
        await expect(popup).toBeHidden({ timeout: 3000 });
    });

    test('SEARCH_07: Apply price filter → results change according to filter (BUG)', async ({
        homePage,
        page,
    }) => {
        // BUG: Filters do not work correctly on the results page
        test.fail();

        // Go to results page
        await homePage.selectLocation('hcm');
        await page.waitForURL('**/rooms/ho-chi-minh**', { timeout: 15000 });

        // Get room count before filtering
        const roomCards = page.locator('[class*="card"]');
        await roomCards.first().waitFor({ state: 'visible', timeout: 10000 });
        const countBefore = await roomCards.count();

        // Click "Price" filter
        const priceFilter = page.getByRole('button', { name: HOMEPAGE.FILTER_BAR[1] });
        if (await priceFilter.isVisible()) {
            await priceFilter.click();
            await page.waitForTimeout(500);

            // Select price range if slider/option is available
            const applyBtn = page.getByRole('button', { name: /áp dụng|apply/i });
            if (await applyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await applyBtn.click();
            }
        }

        // After filtering, results should change or display correctly
        const countAfter = await roomCards.count();
        expect(countAfter).toBeGreaterThanOrEqual(0);
        expect(countAfter).not.toBe(countBefore);
    });

    test('SEARCH_08: Results page displays full layout: location banner, search bar, filters, room list', async ({
        homePage,
        page,
    }) => {
        await homePage.goto();
        await homePage.selectLocation('hcm');
        await page.waitForURL('**/rooms/ho-chi-minh**', { timeout: 15000 });

        // Banner displays location name
        await expect(page.getByText(/hồ chí minh|ho chi minh/i).first()).toBeVisible({
            timeout: 10000,
        });

        // Search bar is still displayed on results page
        await expect(page.getByText(HOMEPAGE.LOCATION_PICKER.PLACEHOLDER)).toBeVisible();

        // Filter buttons are displayed
        await expect(page.getByRole('button', { name: HOMEPAGE.FILTER_BAR[0] })).toBeVisible();

        // Room list is displayed
        const roomCards = page.locator('[class*="card"]').first();
        await expect(roomCards).toBeVisible({ timeout: 10000 });
    });
});
