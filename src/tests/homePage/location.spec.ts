import { test, expect } from '../../fixtures/test-hook';

test.describe('Prominent Location', () => {
    test('PROMINENT_LOCATION_01: Should filter room data by location', async ({
        homePage,
        page,
    }) => {
        // Click on Ho Chi Minh card
        await homePage.selectLocation('hcm');
        await page.waitForURL('**/rooms/ho-chi-minh**', { timeout: 15000 });

        // Only show rooms in HCM
        expect(page.url()).toContain('ho-chi-minh');
        await expect(homePage.roomCards.first()).toBeVisible({ timeout: 10000 });
    });

    test('PROMINENT_LOCATION_02: Should navigate to room list on location click', async ({
        homePage,
        page,
    }) => {
        await homePage.selectLocation('hanoi');
        await page.waitForURL('**/rooms/ha-noi**', { timeout: 15000 });

        expect(page.url()).toContain('ha-noi');
    });

    test('PROMINENT_LOCATION_03: Should switch between locations', async ({ homePage, page }) => {
        // Select HCM first
        await homePage.selectLocation('hcm');
        await page.waitForURL('**/rooms/ho-chi-minh**', { timeout: 15000 });
        expect(page.url()).toContain('ho-chi-minh');

        // Go back to Homepage
        await homePage.goto();
        await page.waitForLoadState('domcontentloaded');

        // Select Hanoi
        await homePage.selectLocation('hanoi');
        await page.waitForURL('**/rooms/ha-noi**', { timeout: 15000 });
        expect(page.url()).toContain('ha-noi');
    });
});
