import { DASHBOARD } from '../../constants/dashboard.config';
import { test, expect } from '../../fixtures/test-hook';

test.describe('Dashboard - Booked Rooms', () => {
    test('BOOKED_01: Should display list of rented rooms', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        await dashboardPage.loginAndGotoDashboard(homePage);

        // await page.waitForLoadState('networkidle');

        const roomCards = page.locator('.ant-card, [class*="room-card"], [class*="booking"]');
        const emptyMessage = page.getByText(DASHBOARD.BOOKED.EMPTY_MESSAGE);
        await Promise.race([
            roomCards.first().waitFor({ state: 'visible', timeout: 15000 }),
            emptyMessage.first().waitFor({ state: 'visible', timeout: 15000 }),
        ]).catch(() => {
            console.log(
                '⚠️ Warning: Waiting for Dashboard UI timed out but proceeding to check assertion.'
            );
        });
        const hasCards = await roomCards
            .first()
            .isVisible({ timeout: 5000 })
            .catch(() => false);
        const hasEmpty = await emptyMessage.isVisible({ timeout: 3000 }).catch(() => false);

        expect(
            hasCards || hasEmpty,
            'Dashboard must display either room list or empty state message'
        ).toBeTruthy();

        if (hasCards) {
            const cardCount = await roomCards.count();
            expect(cardCount).toBeGreaterThan(0);
            const firstCardText = await roomCards.first().textContent();
            expect(firstCardText!.trim().length).toBeGreaterThan(0);
        }
    });

    test('BOOKED_02: Should show message when no rooms rented', async ({
        page,
        homePage,
        dashboardPage,
    }) => {
        // Test with newly registered account (no booked rooms)
        // Use existing account if there are no bookings
        await dashboardPage.loginAndGotoDashboard(homePage);

        const emptyMessage = page.getByText(DASHBOARD.BOOKED.EMPTY_MESSAGE);
        const roomCards = page.locator('.ant-card, [class*="room-card"], [class*="booking"]');

        const cardCount = await roomCards.count();
        if (cardCount === 0) {
            await expect(emptyMessage).toBeVisible();
        } else {
            // Account already has bookings → skip this test
            test.skip();
        }
    });

    test('BOOKED_03: Should load multiple rooms with pagination', async ({
        homePage,
        dashboardPage,
        page,
    }) => {
        // BUG: Pagination does not function when there are multiple rooms
        test.fail();

        await dashboardPage.loginAndGotoDashboard(homePage);

        // await page.waitForLoadState('networkidle');

        const roomCards = page.locator('.ant-card, [class*="room-card"], [class*="booking"]');
        await expect(roomCards.first()).toBeVisible({ timeout: 10000 });

        const pagination = page.locator('.ant-pagination');
        const loadMore = page.getByRole('button', { name: DASHBOARD.BOOKED.BTN_LOAD_MORE });

        const hasPagination = await pagination.isVisible().catch(() => false);
        const hasLoadMore = await loadMore.isVisible().catch(() => false);

        expect(hasPagination || hasLoadMore, 'Must have pagination or load more button').toBeTruthy();
    });
});
