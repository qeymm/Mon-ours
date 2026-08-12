"use client";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
}

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const interactive = !!onChange;
  const starSize = size === "sm" ? "text-sm" : "text-xl";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={`${starSize} ${interactive ? "cursor-pointer" : "cursor-default"} ${
            star <= value ? "text-accent" : "text-ink/20"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
