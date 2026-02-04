export function isBlank(value?: string | null): boolean {
  return value == null || value.trim().length === 0;
}
