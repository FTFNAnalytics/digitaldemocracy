"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Field = {
  key: string;
  label: string;
  type?: "text" | "select" | "number";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  defaultValue?: string;
};

export function UrlFilterForm({
  fields,
  submitLabel = "Apply filters",
}: {
  fields: Field[];
  submitLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    for (const field of fields) {
      const value = String(form.get(field.key) ?? "").trim();
      if (value) next.set(field.key, value);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function onReset() {
    router.replace(pathname, { scroll: false });
  }

  return (
    <form onSubmit={onSubmit} className="obs-card mb-6 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map((field) => {
        const current = searchParams.get(field.key) ?? field.defaultValue ?? "";
        const active = Boolean(current);
        return (
          <label key={field.key} className="block text-sm">
            <span className="mb-1 block font-medium text-navy">{field.label}</span>
            {field.type === "select" ? (
              <select
                name={field.key}
                defaultValue={current}
                className={`obs-input ${active ? "border-accent bg-white" : ""}`}
              >
                <option value="">Any</option>
                {(field.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.key}
                type={field.type === "number" ? "number" : "text"}
                defaultValue={current}
                placeholder={field.placeholder}
                className={`obs-input ${active ? "border-accent bg-white" : ""}`}
              />
            )}
          </label>
        );
      })}
      <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-3">
        <button type="submit" className="obs-btn">
          {submitLabel}
        </button>
        <button type="button" onClick={onReset} className="obs-btn-secondary">
          Clear
        </button>
      </div>
    </form>
  );
}
