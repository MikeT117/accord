import TimeAgoComponent from 'react-timeago';

const timeAgoFormatter = (value: number, unit: TimeAgoComponent.Unit) => {
  if (unit === 'second') return 'just now';
  if (unit === 'minute') return `${value} ${value === 1 ? 'minute' : 'minutes'} ago`;
  if (unit === 'hour') return `${value} ${value === 1 ? 'hour' : 'hours'} ago`;
  if (unit === 'day') return `${value} ${value === 1 ? 'day' : 'days'} ago`;
  if (unit === 'week') return `${value} ${value === 1 ? 'week' : 'weeks'} ago`;
  if (unit === 'month') return `${value} ${value === 1 ? 'month' : 'months'} ago`;
  if (unit === 'year') return `${value} ${value === 1 ? 'year' : 'years'} ago`;
};

export const TimeAgo = ({ className = '', date }: { className?: string; date: Date }) => (
  <TimeAgoComponent formatter={timeAgoFormatter} minPeriod={60} className={className} date={date} />
);
