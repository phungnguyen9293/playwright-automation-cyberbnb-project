import { Page } from '@playwright/test';
import { HOMEPAGE } from '../../constants/homePage.config';
import { test, expect } from '../../fixtures/test-hook';
import { getSearchDateRangeRegex } from '../../utils/dateHelper';

test('Header - Filter bar and search elements must display correct structure', async ({ homePage }) => {
    const dateRangeRegex = getSearchDateRangeRegex(1, 7);
    await homePage.verifyHeaderStructure(HOMEPAGE.FILTER_BAR, dateRangeRegex);
});

test('Date Picker - Must display all static quick selection ranges', async ({ homePage }) => {
    const dateRangeRegex = getSearchDateRangeRegex(1, 7);
    await homePage.openDatePicker(dateRangeRegex);
    await homePage.verifyStaticRanges(HOMEPAGE.DATE_PICKER.STATIC_RANGES);
});

test('Footer - Information sections and links must display correct structure', async ({ homePage }) => {
    await homePage.verifyFooterStructure(HOMEPAGE.FOOTER);
});

test('Responsive - Mobile layout must display hamburger menu toggle', async ({ homePage }) => {
    await homePage.verifyMobileLayout();
});
