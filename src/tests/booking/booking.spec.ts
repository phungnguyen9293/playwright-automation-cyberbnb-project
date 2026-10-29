import { BOOKING } from '../../constants/booking.config';
import { HOMEPAGE } from '../../constants/homePage.config';
import { test, expect } from '../../fixtures/test-hook';

test.describe('Booking', () => {
    const navigateToRoomDetail = async (
        homePage: Awaited<ReturnType<any>>,
        page: import('@playwright/test').Page
    ) => {
        await homePage.selectLocation('hcm');
        await page.waitForURL('**/rooms/ho-chi-minh**', { timeout: 15000 });

        const roomCard = page.locator('a[href*="room-detail"]').first();
        await roomCard.waitFor({ state: 'visible', timeout: 10000 });
        await roomCard.click();
        await page.waitForURL('**/room-detail/**', { timeout: 15000 });
    };

    test('BOOKING_01: Not logged in click Book → show login request notification', async ({
        homePage,
        page,
    }) => {
        await navigateToRoomDetail(homePage, page);

        const bookButton = page.getByRole('button', { name: BOOKING.ROOM_DETAIL.BTN_BOOK });
        await bookButton.scrollIntoViewIfNeeded();
        await bookButton.click();

        const notification = page.getByText(BOOKING.BOOKING_FLOW.LOGIN_ALERT);
        await expect(notification).toBeVisible({ timeout: 5000 });
    });

    test('BOOKING_02: Log in first → book room → success + appears in dashboard', async ({
        homePage,
        page,
    }) => {
        await homePage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);
        const userMenu = page.getByRole('button', { name: /Open user menu/i });
        await expect(userMenu).toBeVisible({ timeout: 10000 });

        await page.goto('/');
        await navigateToRoomDetail(homePage, page);

        const roomTitle = await page.locator('h2').first().textContent();

        const bookButton = page.getByRole('button', { name: BOOKING.ROOM_DETAIL.BTN_BOOK });
        await bookButton.scrollIntoViewIfNeeded();
        await bookButton.click();

        const confirmButton = page.getByRole('button', { name: BOOKING.BOOKING_FLOW.BTN_CONFIRM });
        await expect(confirmButton).toBeVisible({ timeout: 5000 });
        await confirmButton.click();

        const successMessage = page.getByText(BOOKING.BOOKING_FLOW.TOAST_SUCCESS);
        await expect(successMessage).toBeVisible({ timeout: 5000 });

        // Verify booking appears in dashboard
        await page.goto('/');
        await page.getByRole('button', { name: /Open user menu/i }).click();
        await page.locator('#user-dropdown').getByText('Dashboard').click();
        await page.waitForLoadState('domcontentloaded');

        const bookedRoom = page.getByText(roomTitle!.trim()).first();
        await expect(bookedRoom).toBeVisible({ timeout: 10000 });
    });

    test('BOOKING_03: Log in directly on room detail page → book room → success + appears in dashboard', async ({
        homePage,
        page,
    }) => {
        await navigateToRoomDetail(homePage, page);

        const roomTitle = await page.locator('h2').first().textContent();

        // Login from room detail page (avatar button is the first bg-main in nav)
        await page.locator('button.bg-main').first().click();
        await page.locator('#user-dropdown').getByText(HOMEPAGE.LOGIN.BTN_LOGIN).click();
        await page.getByPlaceholder(HOMEPAGE.LOGIN.EMAIL_PLACEHOLDER).fill(process.env.TEST_EMAIL!);
        await page.getByPlaceholder(HOMEPAGE.LOGIN.PASSWORD_PLACEHOLDER).fill(process.env.TEST_PASSWORD!);
        await page.getByRole('button', { name: HOMEPAGE.LOGIN.BTN_LOGIN }).click();

        const userMenu = page.getByRole('button', { name: /Open user menu/i });
        await expect(userMenu).toBeVisible({ timeout: 10000 });

        const bookButton = page.getByRole('button', { name: BOOKING.ROOM_DETAIL.BTN_BOOK });
        await bookButton.scrollIntoViewIfNeeded();
        await bookButton.click();

        const confirmButton = page.getByRole('button', { name: BOOKING.BOOKING_FLOW.BTN_CONFIRM });
        await expect(confirmButton).toBeVisible({ timeout: 5000 });
        await confirmButton.click();

        const successMessage = page.getByText(BOOKING.BOOKING_FLOW.TOAST_SUCCESS);
        await expect(successMessage).toBeVisible({ timeout: 5000 });

        // Verify booking appears in dashboard
        await page.goto('/');
        await page.getByRole('button', { name: /Open user menu/i }).click();
        await page.locator('#user-dropdown').getByText('Dashboard').click();
        await page.waitForLoadState('domcontentloaded');

        const bookedRoom = page.getByText(roomTitle!.trim()).first();
        await expect(bookedRoom).toBeVisible({ timeout: 10000 });
    });

    test('BOOKING_04: Booking modal displays fully: price, reviews, dates, guests, book button, total price, language consistency', async ({
        homePage,
        page,
    }) => {
        // BUG: Inconsistent display
        test.fail();
        await navigateToRoomDetail(homePage, page);

        // Room price per night ($XX / night)
        const priceSection = page.getByText(BOOKING.ROOM_DETAIL.NIGHT_LABEL);
        await priceSection.scrollIntoViewIfNeeded();
        await expect(priceSection).toBeVisible();

        // Rating (star + evaluation)
        const ratingSection = page.getByText(/đánh giá/i).first();
        await expect(ratingSection).toBeVisible();

        // Checkin / Checkout date fields
        await expect(page.getByText(HOMEPAGE.SEARCH.CHECKIN)).toBeVisible();
        await expect(page.getByText(HOMEPAGE.SEARCH.CHECKOUT)).toBeVisible();

        // Guest section with +/- buttons
        await expect(page.getByText('Khách').first()).toBeVisible();
        await expect(page.getByRole('button', { name: '–' })).toBeVisible();
        await expect(page.getByRole('button', { name: '+' })).toBeVisible();

        // Book button
        await expect(page.getByRole('button', { name: BOOKING.ROOM_DETAIL.BTN_BOOK })).toBeVisible();

        // Not charged message
        await expect(page.getByText(BOOKING.BOOKING_FLOW.NOT_CHARGED_YET)).toBeVisible();

        // Total before taxes
        await expect(page.getByText(BOOKING.BOOKING_FLOW.TOTAL_LABEL)).toBeVisible();

        // Language consistency: "Cleaning fee" and "Total before taxes" are EN in VN UI
        const cleaningFee = page.getByText(BOOKING.BOOKING_FLOW.CLEANING_FEE);
        const totalEN = page.getByText(BOOKING.BOOKING_FLOW.TOTAL_LABEL);
        const hasEnglishMix = (await cleaningFee.isVisible()) || (await totalEN.isVisible());
        expect
            .soft(hasEnglishMix, 'Booking modal has mixed EN/VN language - inconsistent')
            .toBeFalsy();
    });

    test('BOOKING_05: Select past date (Yesterday) → must not apply to check-in (BUG: app allows)', async ({
        homePage,
        page,
    }) => {
        // BUG: Date picker allows selecting past dates (Yesterday, Last Week, Last Month)
        test.fail();

        await navigateToRoomDetail(homePage, page);

        const checkinField = page.getByText(HOMEPAGE.SEARCH.CHECKIN).locator('..');
        await checkinField.scrollIntoViewIfNeeded();
        await checkinField.click();

        const picker = page.locator('.rdrDateRangePickerWrapper');
        await expect(picker).toBeVisible({ timeout: 5000 });

        // Select "Yesterday" → date picker should not allow past dates
        await picker.getByText('Yesterday').click();
        await page.getByText('Close').click();

        // Past dates should not be applied to check-in
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dd = String(yesterday.getDate()).padStart(2, '0');
        const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
        const yyyy = yesterday.getFullYear();
        const yesterdayFormatted = `${dd}-${mm}-${yyyy}`;

        const checkinDate = checkinField.getByText(yesterdayFormatted);
        await expect(checkinDate).toBeHidden({ timeout: 3000 });
    });

    test('BOOKING_06: Increase/decrease guest count using +/– → correct values, within min/max limits', async ({
        homePage,
        page,
    }) => {
        await navigateToRoomDetail(homePage, page);

        const incrementBtn = page.getByRole('button', { name: '+' });
        const decrementBtn = page.getByRole('button', { name: '–' });
        const guestCount = page.getByText(new RegExp(`\\d+ ${HOMEPAGE.SEARCH.GUEST_SUFFIX}`)).first();

        await incrementBtn.scrollIntoViewIfNeeded();

        // Get initial guest count
        const initialText = await guestCount.textContent();
        const initialCount = parseInt(initialText?.replace(/\D/g, '') || '1');

        // Click + to increase
        await incrementBtn.click();
        await expect(guestCount).toHaveText(`${initialCount + 1} ${HOMEPAGE.SEARCH.GUEST_SUFFIX}`, { timeout: 3000 });

        // Click – to decrease back to initial
        await decrementBtn.click();
        await expect(guestCount).toHaveText(`${initialCount} ${HOMEPAGE.SEARCH.GUEST_SUFFIX}`, { timeout: 3000 });

        // Test lower limit: click – until minimum
        for (let i = 0; i < initialCount; i++) {
            await decrementBtn.click();
        }
        const minText = await guestCount.textContent();
        const minCount = parseInt(minText?.replace(/\D/g, '') || '0');
        expect(minCount).toBeGreaterThanOrEqual(1);

        // Get max guests from room description (e.g. "3 Khách • Phòng Studio")
        const roomInfo = page.getByText(/\d+ Khách/i).first();
        const roomInfoText = await roomInfo.textContent();
        const maxGuest = parseInt(roomInfoText?.match(/(\d+)\s*Khách/i)?.[1] || '10');

        // Test upper limit: click + multiple times past max
        for (let i = minCount; i <= maxGuest + 1; i++) {
            await incrementBtn.click();
        }
        const afterMaxText = await guestCount.textContent();
        const afterMaxCount = parseInt(afterMaxText?.replace(/\D/g, '') || '0');
        expect(afterMaxCount).toBeLessThanOrEqual(maxGuest);
    });

    test('BOOKING_07: Click Check-in → opens date picker, select dates → displays correctly on modal', async ({
        homePage,
        page,
    }) => {
        await navigateToRoomDetail(homePage, page);

        // Click on Check-in field (scoped precisely using cursor-pointer class)
        const checkinField = page
            .locator('div.cursor-pointer')
            .filter({ hasText: HOMEPAGE.SEARCH.CHECKIN })
            .first();
        await checkinField.scrollIntoViewIfNeeded();
        await checkinField.click();

        const picker = page.locator('.rdrDateRangePickerWrapper');
        await expect(picker).toBeVisible({ timeout: 5000 });

        // Select "This Week" to set dates
        await picker.getByText('This Week').click();

        // Close picker
        await page.getByText('Close').click();
        await expect(picker).toBeHidden({ timeout: 3000 });

        // Checkin and checkout dates must display on booking modal (format DD-MM-YYYY)
        const checkinDate = checkinField.getByText(/\d{2}-\d{2}-\d{4}/);
        await expect(checkinDate).toBeVisible();

        const checkoutField = page
            .locator('div.cursor-pointer')
            .filter({ hasText: HOMEPAGE.SEARCH.CHECKOUT })
            .first();
        const checkoutDate = checkoutField.getByText(/\d{2}-\d{2}-\d{4}/);
        await expect(checkoutDate).toBeVisible();
    });
});
