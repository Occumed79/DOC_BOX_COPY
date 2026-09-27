export function cn(...classes: unknown[]) {
  return classes.filter(value => typeof value === "string" && value.length > 0).join(" ");
}
