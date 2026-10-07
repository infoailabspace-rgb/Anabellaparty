export default function ImagePlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-tile border-2 border-gold/40 bg-gradient-to-br from-navy via-bg to-black p-6 text-center ${className}`}
      role="img"
      aria-label={label}
    >
      <span className="font-display text-sm font-semibold tracking-wide text-gold/80">
        {label}
      </span>
    </div>
  );
}
