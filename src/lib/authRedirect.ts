/** Safe in-app path for post-login redirect (HashRouter pathname + search). */
export function safeReturnPath(from: unknown): string | null {
  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//")) return null;
  if (from === "/login" || from.startsWith("/login?") || from === "/signup" || from.startsWith("/signup?")) {
    return null;
  }
  return from;
}

export function loginRedirectState(pathname: string, search = "") {
  return { from: pathname + search };
}
