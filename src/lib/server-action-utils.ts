export function isServerActionMismatchError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("Failed to find Server Action") ||
    msg.includes("Server Reference ID") ||
    msg.includes("INVALID_SERVER_ACTION") ||
    msg.includes("did not match the expected format") ||
    msg.includes("deployment")
  );
}
