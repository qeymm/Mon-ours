interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export function EmptyState({
  icon = "🥐",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="text-5xl mb-4 opacity-80">{icon}</div>
      <h3 className="font-display text-xl font-semibold text-ink mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-ink/60 text-sm mb-4 max-w-xs">{description}</p>
      )}
      {action && (
        <a
          href={action.href}
          className="bg-brand text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-brand/90 transition"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
