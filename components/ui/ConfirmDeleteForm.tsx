"use client";

export function ConfirmDeleteForm({
  action,
  confirmMessage,
  children,
  className = "tap h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
