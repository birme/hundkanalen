type Props = { status: string };

const statusStyles: Record<string, string> = {
  upcoming: 'bg-forest-100 text-forest-700',
  active: 'bg-wood-100 text-wood-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-falu-100 text-falu-700',
};

const statusLabels: Record<string, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function StayStatusBadge({ status }: Props) {
  const styles = statusStyles[status] ?? 'bg-gray-100 text-gray-700';
  const label = statusLabels[status] ?? status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles}`}
    >
      {label}
    </span>
  );
}
