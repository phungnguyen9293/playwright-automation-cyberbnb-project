export const ROOMPAGE = {
    ROOMPAGE_TITLE: 'Danh sách phòng hiện tại',
    SEARCH_PAGE_CONSTANTS: {
        RESULTS_REGEX: (location?: string | null) => {
            const locationPattern = location
                ? `${location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`
                : '';
            return new RegExp(
                `Có\\s+\\d+\\s+chỗ ở\\s+(tại\\s+${locationPattern})?•\\s+\\d{2}/\\d{2}/\\d{4}\\s+–\\s+\\d{2}/\\d{2}/\\d{4}`
            );
        },
        CATEGORIES: [
            'Toàn bộ nhà',
            'Chỗ ở độc đáo',
            'Trang trại và thiên nhiên',
            'Cho phép mang theo thú cưng',
        ],
    },
    LOCATION_PICKER: {
        PLACEHOLDER: 'Bạn sắp đi đâu?',
        TITLE: 'Tìm kiếm địa điểm',
    },
    DATE_PICKER: {
        STATIC_RANGES: ['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month'],
    },
    FILTER_BAR: ['Loại nơi ở', 'Giá', 'Đặt ngay', 'Phòng và phòng ngủ', 'Bộ lọc khác'],
    SEARCH_BAR: {
        LOCATION_LABEL: 'Địa điểm',
        GUEST_LABEL: 'Thêm khách',
        DATE_FORMAT: 'DD/MM/YYYY',
    },
    FOOTER: {
        COPYRIGHT_ANCHOR: /© 2022/i,
        LANGUAGE: 'Tiếng Việt (VN)',
        // Chuyển từ mảng Heading đơn thuần sang mảng Object chứa cả Link
        SECTIONS: [
            {
                TITLE: /Giới thiệu/i,
                LINKS: [
                    'Phương thức hoạt động của Cyber',
                    'Trang tin tức',
                    'Nhà đầu tư',
                    'Cyber Plus',
                    'Cyber Luxe',
                    'HotelTonight',
                    'Cyber for Work',
                    'Nhờ có Host, mọi điều đều có thể',
                    'Cơ hội nghề nghiệp',
                    'Thư của nhà sáng lập',
                ],
            },
            {
                TITLE: /Cộng đồng/i,
                LINKS: [
                    'Sự đa đạng và Cảm giác thân thuộc',
                    'Tiện nghi phù hợp cho người khuyết tật',
                    'Đối tác liên kết Cyber',
                    'Chỗ ở cho tuyến đầu',
                    'Lượt giới thiệu của khách',
                    'CyberSoft.edu.vn',
                ],
            },
            {
                TITLE: /Đón tiếp khách/i,
                LINKS: [
                    'Cho thuê nhà',
                    'Tổ chức Trải nghiệm trực tuyến',
                    'Tổ chức Trải nghiệm',
                    'Đón tiếp khách có trách nhiệm',
                    'Trung tâm tài nguyên',
                    'Trung tâm cộng đồng',
                ],
            },
            {
                TITLE: /Hỗ trợ/i,
                LINKS: [
                    'Biện pháp ứng phó đại dịch COVID-19',
                    'Trung tâm trợ giúp',
                    'Các tùy chọn hủy',
                    'Hỗ trợ khu dân cư',
                    'Tin cây và an toàn',
                ],
            },
        ],
    },
};
