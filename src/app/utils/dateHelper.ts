export const formatDateForEmail = (date: Date = new Date()): string => {
    return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).replace(',', ' at');
};

export const getOTPExpiryDate = (minutes: number): Date => {
    return new Date(Date.now() + minutes * 60 * 1000);
};