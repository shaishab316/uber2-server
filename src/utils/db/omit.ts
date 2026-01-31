/**
 * Omit specified fields from an object.
 */
export function omit<T>(
  obj: T,
  fields: Partial<Record<keyof T, boolean>>,
): Omit<T, keyof typeof fields> {
  for (const key in fields) {
    if (fields[key as keyof T]) {
      delete obj[key as keyof T];
    }
  }
  return obj as Omit<T, keyof typeof fields>;
}
