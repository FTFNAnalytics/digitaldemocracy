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
    <form
      onSubmit={onSubmit}
      className="mb-6 grid gap-3 rounded-sm border border-obs-rule bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {fields.map((field) => (
        <label key={field.key} className="block text-sm">
          <span className="mb-1 block font-medium text-navy">{field.label}</span>
          {field.type === "select" ? (
            <select
              name={field.key}
              defaultValue={searchParams.get(field.key) ?? field.defaultValue ?? ""}
              className="w-full rounded-sm border border-navy/20 bg-obs-paper px-2 py-2 text-navy outline-none focus:ring-2 focus:ring-obs-teal/40"
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
              defaultValue={searchParams.get(field.key) ?? field.defaultValue ?? ""}
              placeholder={field.placeholder}
              className="w-full rounded-sm border border-navy/20 bg-obs-paper px-2 py-2 text-navy outline-none focus:ring-2 focus:ring-obs-teal/40"
            />
          )}
        </label>
      ))}
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
        <button
          type="submit"
          className="rounded-sm bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-sm border border-navy/20 px-4 py-2 text-sm font-medium text-navy hover:bg-obs-paper"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
