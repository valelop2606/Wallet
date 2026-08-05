interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-400 text-sm mb-3">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-primary-600 text-sm font-medium hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
