const ICONS = [
  "🛒", "🚗", "🏠", "💡", "🩺", "🎉", "📚", "👕",
  "⚽", "🖨️", "📦", "💼", "🍔", "☕", "🎁", "🐶",
  "⛽", "🚕", "✈️", "💊", "🎮", "📱", "💳", "🧾",
];

export function IconPicker({ defaultValue }: { defaultValue?: string | null }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Ícono">
      <label className="cursor-pointer">
        <input type="radio" name="icon" value="" defaultChecked={!defaultValue} className="peer sr-only" />
        <span className="tap flex items-center justify-center h-11 px-3 rounded-full text-xs font-medium border bg-gray-50 text-gray-500 border-transparent transition-colors peer-checked:bg-brand-primary peer-checked:text-white peer-checked:border-brand-primary">
          Auto
        </span>
      </label>
      {ICONS.map((icon) => (
        <label key={icon} className="cursor-pointer">
          <input
            type="radio"
            name="icon"
            value={icon}
            defaultChecked={icon === defaultValue}
            className="peer sr-only"
          />
          <span className="tap flex items-center justify-center h-11 w-11 rounded-full text-xl border bg-gray-50 border-transparent transition-colors peer-checked:bg-brand-primary/10 peer-checked:border-brand-primary">
            {icon}
          </span>
        </label>
      ))}
    </div>
  );
}
