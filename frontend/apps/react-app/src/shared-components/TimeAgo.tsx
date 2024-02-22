import { memo } from 'react';
import TimeAgoComponent from 'react-timeago';
import { useI18nContext } from '../i18n/i18n-react';
import { LocalizedString } from 'typesafe-i18n';

const timeAgoFormatter =
    (unitStrs: {
        JustNow: () => LocalizedString;
        Minute: () => LocalizedString;
        Minutes: () => LocalizedString;
        Hour: () => LocalizedString;
        Hours: () => LocalizedString;
        Day: () => LocalizedString;
        Days: () => LocalizedString;
        Weeks: () => LocalizedString;
        Week: () => LocalizedString;
        Month: () => LocalizedString;
        Months: () => LocalizedString;
        Year: () => LocalizedString;
        Years: () => LocalizedString;
        In: () => LocalizedString;
        Ago: () => LocalizedString;
    }) =>
    (value: number, unit: TimeAgoComponent.Unit, suffix: string) => {
        switch (unit) {
            case 'second':
                return unitStrs.JustNow();
            case 'minute':
                return `${suffix !== 'ago' ? unitStrs.In() : ''} ${value} ${
                    value === 1 ? unitStrs.Minute() : unitStrs.Minutes()
                } ${suffix === 'ago' ? unitStrs.Ago() : ''}`;
            case 'hour':
                return `${suffix !== 'ago' ? unitStrs.In() : ''} ${value} ${
                    value === 1 ? unitStrs.Hour() : unitStrs.Hours()
                } ${suffix === 'ago' ? unitStrs.Ago() : ''}`;
            case 'day':
                return `${suffix !== 'ago' ? unitStrs.In() : ''} ${value} ${
                    value === 1 ? unitStrs.Day() : unitStrs.Hours()
                } ${suffix === 'ago' ? unitStrs.Ago() : ''}`;
            case 'week':
                return `${suffix !== 'ago' ? unitStrs.In() : ''} ${value} ${
                    value === 1 ? unitStrs.Week() : unitStrs.Weeks()
                } ${suffix === 'ago' ? unitStrs.Ago() : ''}`;
            case 'month':
                return `${suffix !== 'ago' ? unitStrs.In() : ''} ${value} ${
                    value === 1 ? unitStrs.Month() : unitStrs.Months()
                } ${suffix === 'ago' ? unitStrs.Ago() : ''}`;
            case 'year':
                return `${suffix !== 'ago' ? unitStrs.In() : ''} ${value} ${
                    value === 1 ? unitStrs.Year() : unitStrs.Years()
                } ${suffix === 'ago' ? unitStrs.Ago() : ''}`;
        }
    };

export const TimeAgo = memo(({ className = '', date }: { className?: string; date: Date }) => {
    const { LL } = useI18nContext();
    return (
        <TimeAgoComponent
            formatter={timeAgoFormatter(LL.Time)}
            minPeriod={60}
            className={className}
            date={date}
        />
    );
});
