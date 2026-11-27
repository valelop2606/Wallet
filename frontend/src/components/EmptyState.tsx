import Icon from './Icon';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-6">
      <span className="flex items-center justify-center w-12 h-12 mb-3 rounded-2xl bg-gray-100 text-gray-400">
        <Icon name="inbox" size={22} />
      </span>
      <p className="text-gray-500 text-sm max-w-[240px]">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="chip-primary mt-4">
          <Icon name="plus" size={14} strokeWidth={2.4} />
          {actionLabel.replace(/^\+\s*/, '')}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
