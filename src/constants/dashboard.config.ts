export const DASHBOARD = {
    AVATAR: {
        BTN_UPLOAD: /Upload/i,
        BTN_CLOSE: 'Close',
        BTN_UPDATE_PHOTO: 'Cập nhật ảnh',
        TOAST_SUCCESS: /thành công|success/i,
        TOAST_SELECT_ERR: /chọn|select/i,
        TOAST_FORMAT_ERR: /format|định dạng|không hợp lệ/i,
        TOAST_SIZE_ERR: /size|kích thước|dung lượng/i,
    },
    PROFILE: {
        HEADING_EDIT: 'Chỉnh sửa hồ sơ',
        BTN_UPDATE: 'Cập nhật',
        TOAST_SUCCESS: 'Cập nhật thông tin thành công',
        ERR_EMAIL_EMPTY: 'Vui lòng nhập email!',
        ERR_EMAIL_INVALID: /hợp lệ|invalid/i,
        ERR_NAME_EMPTY: 'Vui lòng nhập họ tên!',
        ERR_PHONE_EMPTY: 'Vui lòng nhập số điện thoại!',
        ERR_PHONE_INVALID: 'Sai định dạng số điện thoại!',
        ERR_BIRTHDAY_EMPTY: /ngày sinh/i,
        ERR_GENDER_EMPTY: 'Vui lòng chọn giới tính',
    },
    BOOKED: {
        EMPTY_MESSAGE: /chưa thuê|haven.*booked|no.*room/i,
        BTN_LOAD_MORE: /xem thêm|load more/i,
    },
    EARNINGS: {
        MENU_LINK: /thu nhập|earnings/i,
        HEADING: /tổng thu nhập|total earnings|transaction/i,
        NO_INCOME_MSG: /chưa có thu nhập|no income|tổng thu nhập|total/i,
    },
};
