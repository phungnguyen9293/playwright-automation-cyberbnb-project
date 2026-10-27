import { Page } from '@playwright/test';
import { HOMEPAGE } from '../../constants/homePage.config';
import { test, expect } from '../../fixtures/test-hook';
import { getSearchDateRangeRegex } from '../../utils/dateHelper';

test('Test Layout - Header, Footer, and Date Picker must display correct structure', async ({ homePage }) => {
    await homePage.goto();
    await test.step('Header - Filter bar and search elements must display correct structure', async () => {
        const dateRangeRegex = getSearchDateRangeRegex(1, 7);
        await homePage.verifyHeaderStructure(HOMEPAGE.FILTER_BAR, dateRangeRegex);
    });

    await test.step('Date Picker - Must display all static quick selection ranges', async () => {
        const dateRangeRegex = getSearchDateRangeRegex(1, 7);
        await homePage.openDatePicker(dateRangeRegex);
        await homePage.verifyStaticRanges(HOMEPAGE.DATE_PICKER.STATIC_RANGES);
    });

    await test.step('Footer - Information sections and links must display correct structure', async () => {
        await homePage.verifyFooterStructure(HOMEPAGE.FOOTER);
    });

    await test.step('Responsive - Mobile layout must display hamburger menu toggle', async () => {
        await homePage.verifyMobileLayout();
    });

});