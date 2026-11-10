/*
 * Status chip. Every tone renders in the same uniform violet chip style
 * (`.k-chip` in app/globals.css); `tone` is kept so call sites don't change,
 * and the label carries the meaning.
 */
export function Badge({ tone, children }) {
  return (
    <span className="k-chip" data-tone={tone}>
      {children}
    </span>
  );
}
