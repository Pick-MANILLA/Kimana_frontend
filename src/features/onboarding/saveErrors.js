/**
 * Maps a backend `field_errors` payload onto react-hook-form fields.
 * `fieldMap` translates backend keys (e.g. `cac_number`) to form field names;
 * keys missing from the map are ignored rather than guessed at.
 * Returns true when at least one field was flagged.
 */
export function applyFieldErrors(error, setError, fieldMap) {
  const fieldErrors = error?.fieldErrors ?? {};
  let applied = false;
  for (const [serverKey, message] of Object.entries(fieldErrors)) {
    const field = fieldMap[serverKey];
    if (!field || !message) continue;
    setError(field, { type: 'server', message: String(message) }, { shouldFocus: !applied });
    applied = true;
  }
  return applied;
}
