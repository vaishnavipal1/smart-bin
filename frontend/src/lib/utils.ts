// frontend/src/lib/utils.ts

// A simple helper to join class names conditionally
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
