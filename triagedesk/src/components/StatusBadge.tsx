interface Props {
  label: string;
  color: string; // Tailwind classes like "bg-green-100 text-green-800"
}

export function StatusBadge({ label, color }: Props) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
}
