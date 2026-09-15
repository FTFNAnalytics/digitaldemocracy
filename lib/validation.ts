export function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function requiredText(
  value: string,
  { min = 1, max = 2000, label = "This field" }: { min?: number; max?: number; label?: string } = {},
): string | null {
  const trimmed = value.trim();
  if (trimmed.length < min) {
    return min <= 1
      ? `${label} is required.`
      : `${label} must be at least ${min} characters.`;
  }
  if (trimmed.length > max) {
    return `${label} must be ${max} characters or fewer.`;
  }
  return null;
}

export function emailError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Email is required.";
  if (!isValidEmail(trimmed)) return "Enter a valid email address.";
  return null;
}
