/**
 * Flatten Mongoose lean() results into plain JSON-safe values so they can
 * cross the React Server Component boundary into client components. React
 * rejects anything carrying a toJSON method or non-plain prototype — which
 * every ObjectId, Date, and Buffer inside a lean() document does.
 *
 * The type parameter is an assertion, not a conversion: at runtime ObjectIds
 * become strings and Dates become ISO strings, exactly like the
 * `JSON.parse(JSON.stringify(...))` pattern this replaces.
 *
 * Rule of thumb: any `.lean()` result (or object containing one) passed as a
 * prop to a `"use client"` component must go through this first.
 */
export function serialize<T>(value: unknown): T {
  // eslint-disable-next-line no-restricted-syntax -- the one sanctioned use
  return JSON.parse(JSON.stringify(value)) as T;
}
