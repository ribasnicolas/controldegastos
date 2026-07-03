type Option = { value: string; label: string };

export function SegmentedToggle({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: Option[];
  defaultValue?: string;
}) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <label key={option.value} className="flex-1 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            defaultChecked={option.value === defaultValue}
            required
            className="peer sr-only"
          />
          <span className="flex h-11 items-center justify-center rounded-xl text-sm font-medium border bg-gray-50 text-gray-700 border-transparent transition-colors peer-checked:bg-brand-primary peer-checked:text-white peer-checked:border-brand-primary dark:bg-gray-800 dark:text-gray-300">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
