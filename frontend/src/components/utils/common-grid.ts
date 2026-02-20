export class CommonGrid {
    static formatCurrency({ value }: { value: number }) {
        if (value === null || value === undefined) return '';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    }

    static formatNumber({ value }: { value: number }) {
        if (value === null || value === undefined) return '';
        return new Intl.NumberFormat('en-US').format(value);
    }

    static formatDate({ value }: { value: string | Date }) {
        if (!value) return '';
        const date = typeof value === 'string' ? new Date(value) : value;
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date).replace(/\.$/, '');
    }

    static formatDateTime({ value }: { value: string | Date }) {
        if (!value) return '';
        const date = typeof value === 'string' ? new Date(value) : value;
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
    }
}

