export const getSearchDateRangeRegex = (daysFromNow: number = 0, duration: number = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + daysFromNow);

    const endDate = new Date(startDate);
    // Quan trọng: Phải lấy mốc từ startDate đã tính ở trên
    endDate.setDate(startDate.getDate() + duration);

    // Hàm format con để tái sử dụng
    const format = (d: Date) => ({
        day: d.getDate().toString().padStart(2, '0'),
        month: (d.getMonth() + 1).toString().padStart(2, '0'),
        year: d.getFullYear(),
    });

    const start = format(startDate);
    const end = format(endDate);

    return new RegExp(
        `${start.day}\/${start.month}\/${start.year}.*${end.day}\/${end.month}\/${end.year}`,
        'i'
    );
};
