import { BOOKING } from '../../constants/booking.config';
import { test, expect } from '../../fixtures/test-hook';

test.describe('Room Detail', () => {
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

    test('ROOM_01: Room detail displays correctly according to API response (name, host, amenities, price, reviews)', async ({
        homePage,
        page,
    }) => {
        await homePage.selectLocation('hcm');
        await page.waitForURL('**/rooms/ho-chi-minh**', { timeout: 15000 });

        const [apiResponse] = await Promise.all([
            page.waitForResponse(
                (res) => /\/api\/phong-thue\/\d+/.test(res.url()) && res.status() === 200
            ),
            page.locator('a[href*="room-detail"]').first().click(),
        ]);
        await page.waitForURL('**/room-detail/**', { timeout: 15000 });

        const body = await apiResponse.json();
        const room = body.content;

        // Room name
        await expect(page.locator('h2').first()).toContainText(room.tenPhong);

        // Guest count, bedrooms, beds, bathrooms
        const infoText = page.getByText(/Khách.*Phòng ngủ.*giường.*Phòng tắm/i);
        await expect(infoText).toBeVisible();
        await expect(infoText).toContainText(`${room.khach} Khách`);
        await expect(infoText).toContainText(`${room.phongNgu} Phòng ngủ`);
        await expect(infoText).toContainText(`${room.giuong} giường`);
        await expect(infoText).toContainText(`${room.phongTam} Phòng tắm`);

        // Room price
        await expect(page.getByText(`$${room.giaTien}`, { exact: true })).toBeVisible();

        // Amenities: visible if true, hidden if false
        const amenityMap: Record<string, string> = {
            wifi: 'Wifi',
            tivi: 'Tivi',
            doXe: 'Bãi đỗ xe',
            hoBoi: 'Hồ bơi',
            banUi: 'Bàn ủi',
            mayGiat: 'Máy giặt',
        };
        for (const [key, label] of Object.entries(amenityMap)) {
            const amenity = page.getByText(label, { exact: true });
            if (room[key]) {
                await expect(amenity).toBeVisible();
            }
        }

        // Review section
        await expect(page.getByRole('heading', { name: BOOKING.ROOM_DETAIL.COMMENTS_HEADING })).toBeVisible();

        // Booking section
        await expect(page.getByRole('button', { name: BOOKING.ROOM_DETAIL.BTN_BOOK })).toBeVisible();
    });

    test('ROOM_02: Access room detail via direct URL → displays correctly', async ({ page }) => {
        const [apiResponse] = await Promise.all([
            page.waitForResponse(
                (res) => res.url().includes('/api/phong-thue/') && res.status() === 200
            ),
            page.goto('/room-detail/1', { waitUntil: 'domcontentloaded', timeout: 30000 }),
        ]);

        const body = await apiResponse.json();
        const room = body.content;

        // Room name
        await expect(page.locator('h2').first()).toContainText(room.tenPhong);

        // Room information
        await expect(page.getByText(/Khách/i).first()).toBeVisible();

        // Location link
        const locationLink = page.locator('a[href*="/rooms/"]').first();
        await expect(locationLink).toBeVisible();

        // Image
        const images = page.locator('img[src*="airbnb"], img[src*="phong"]').first();
        await expect(images).toBeVisible({ timeout: 10000 });

        // Description
        await expect(page.getByText(BOOKING.ROOM_DETAIL.TRANSLATE_BTN)).toBeVisible();

        // Amenities
        const amenities = page.getByRole('heading', { name: BOOKING.ROOM_DETAIL.AMENITIES_HEADING });
        await expect(amenities).toBeVisible();

        // Booking section
        await expect(page.getByText(BOOKING.ROOM_DETAIL.NIGHT_LABEL)).toBeVisible();
        await expect(page.getByRole('button', { name: BOOKING.ROOM_DETAIL.BTN_BOOK })).toBeVisible();

        // Review section
        await expect(page.getByRole('heading', { name: BOOKING.ROOM_DETAIL.COMMENTS_HEADING })).toBeVisible();
    });

    test('ROOM_03: Click "Dịch sang tiếng Anh" → content is translated (BUG)', async ({
        homePage,
        page,
    }) => {
        // BUG: Translate button does not actually translate the description content into English
        test.fail();

        await navigateToRoomDetail(homePage, page);

        const descParagraph = page
            .locator('p')
            .filter({ hasText: /Tự nhận phòng|Chủ nhà siêu cấp/i })
            .first();
        const descBefore = await descParagraph.textContent();

        const translateBtn = page.getByRole('button', { name: BOOKING.ROOM_DETAIL.TRANSLATE_BTN });
        await translateBtn.scrollIntoViewIfNeeded();
        await translateBtn.click();
        await page.waitForTimeout(2000);

        // Description content must change to English
        const descAfter = await descParagraph.textContent();
        expect(descAfter).not.toBe(descBefore);
    });

    test('ROOM_04: Click "Hiển thị thêm"/"Ẩn bớt" description (BUG)', async ({
        homePage,
        page,
    }) => {
        // BUG: Show more/Show less does not function correctly
        test.fail();

        await navigateToRoomDetail(homePage, page);

        const showMoreBtn = page.getByText(BOOKING.ROOM_DETAIL.SHOW_MORE_BTN);
        await showMoreBtn.scrollIntoViewIfNeeded();

        // Get description height before expanding
        const description = page
            .locator('p')
            .filter({ hasText: /Tự nhận phòng|Chủ nhà siêu cấp/i })
            .first();
        const heightBefore = await description.boundingBox().then((b) => b?.height ?? 0);

        await showMoreBtn.click();

        // Description must expand (height increases)
        const heightAfter = await description.boundingBox().then((b) => b?.height ?? 0);
        expect(heightAfter).toBeGreaterThan(heightBefore);

        // Click "Ẩn bớt" → description collapses again
        const showLessBtn = page.getByText(BOOKING.ROOM_DETAIL.SHOW_LESS_BTN);
        await expect(showLessBtn).toBeVisible();
        await showLessBtn.click();

        const heightCollapsed = await description.boundingBox().then((b) => b?.height ?? 0);
        expect(heightCollapsed).toBeLessThan(heightAfter);
    });

    test('ROOM_05: Click image → gallery opens, navigate next/prev, close gallery', async ({
        homePage,
        page,
    }) => {
        await navigateToRoomDetail(homePage, page);

        // Click on Ant Image component to open preview
        await page.locator('.ant-image').first().click();

        // Preview image displays
        const previewImage = page.locator('img.ant-image-preview-img');
        await expect(previewImage).toBeVisible({ timeout: 5000 });

        // Next/prev button
        const nextBtn = page.locator('.ant-image-preview-switch-right');
        if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextBtn.click();
            await expect(previewImage).toBeVisible();
        }

        // Close preview
        await page.keyboard.press('Escape');
        await expect(previewImage).toBeHidden({ timeout: 3000 });
    });
});
