export function optionalSummary(value: string | null | undefined): string {
  return (value ?? "").trim();
}
