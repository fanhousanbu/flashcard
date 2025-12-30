import type { ClozeData, ClozeField } from '@/lib/types/deck';

/**
 * Regex pattern to match cloze deletions in the format {{c1::answer}} or {{c2::answer::hint}}
 * - c\d+ matches the cloze identifier (c1, c2, c3, etc.)
 * - :: separates the identifier from the answer
 * - (::(.+?))? optionally captures the hint after a second ::
 * - }} closes the cloze deletion
 */
const CLOZE_REGEX = /\{\{c(\d+)::([^}\|]+?)(?:::(.+?))?\}\}/g;

/**
 * Parse a cloze string and extract all cloze fields
 * @param text - The text containing cloze deletions
 * @returns Parsed cloze data with all fields
 *
 * @example
 * parseCloze("{{c1::Paris}} is the capital of {{c2::France}}")
 * // Returns:
 * // {
 * //   original: "{{c1::Paris}} is the capital of {{c2::France}}",
 * //   fields: [
 * //     { id: "c1", answer: "Paris", hint: undefined },
 * //     { id: "c2", answer: "France", hint: undefined }
 * //   ]
 * // }
 */
export function parseCloze(text: string): ClozeData {
  const fields: ClozeField[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  CLOZE_REGEX.lastIndex = 0;

  // Find all cloze deletions
  while ((match = CLOZE_REGEX.exec(text)) !== null) {
    const [, id, answer, hint] = match;
    fields.push({
      id: `c${id}`,
      answer: answer.trim(),
      hint: hint?.trim(),
    });
  }

  return {
    original: text,
    fields,
  };
}

/**
 * Render a cloze field for display on the card front (with blanks)
 * @param data - Parsed cloze data
 * @param fieldId - The field ID to render (e.g., "c1")
 * @returns The rendered text with the specified field as a blank
 *
 * @example
 * renderClozeFront(
 *   { original: "{{c1::Paris}} is {{c2::France}}", fields: [...] },
 *   "c1"
 * )
 * // Returns: "[...] is France"
 */
export function renderClozeFront(data: ClozeData, fieldId: string): string {
  let result = data.original;
  const field = data.fields.find((f) => f.id === fieldId);

  if (!field) {
    // If field not found, show all clozes as blanks
    return result.replace(CLOZE_REGEX, '[...]');
  }

  // Create regex for this specific field
  const fieldRegex = new RegExp(
    `\\{\\{${field.id}::([^}\|]+?)(?:::(.+?))?\\}\\}`,
    'g'
  );

  // Replace only the specified field with blank
  result = result.replace(fieldRegex, '[...]');

  // Replace all other cloze fields with their answers
  result = result.replace(CLOZE_REGEX, (_, id, answer) => answer);

  return result;
}

/**
 * Render a cloze field for display on the card back (with answer revealed)
 * @param data - Parsed cloze data
 * @param fieldId - The field ID to render (e.g., "c1")
 * @returns The rendered text with the specified field highlighted
 *
 * @example
 * renderClozeBack(
 *   { original: "{{c1::Paris}} is {{c2::France}}", fields: [...] },
 *   "c1"
 * )
 * // Returns: "**Paris** is France"
 */
export function renderClozeBack(data: ClozeData, fieldId: string): string {
  let result = data.original;
  const field = data.fields.find((f) => f.id === fieldId);

  if (!field) {
    // If field not found, reveal all clozes
    return result.replace(CLOZE_REGEX, (_, __, answer) => answer);
  }

  // Create regex for this specific field
  const fieldRegex = new RegExp(
    `\\{\\{${field.id}::([^}\|]+?)(?:::(.+?))?\\}\\}`,
    'g'
  );

  // Replace the specified field with highlighted answer
  result = result.replace(fieldRegex, `**${field.answer}**`);

  // Replace all other cloze fields with their answers
  result = result.replace(CLOZE_REGEX, (_, __, answer) => answer);

  return result;
}

/**
 * Get the number of cloze fields in the text
 * @param text - The text containing cloze deletions
 * @returns The number of cloze fields
 */
export function getClozeFieldCount(text: string): number {
  const matches = text.match(/\{\{c\d+::/g);
  return matches ? matches.length : 0;
}

/**
 * Validate cloze syntax
 * @param text - The text to validate
 * @returns Validation result with errors if any
 */
export function validateCloze(text: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for unbalanced braces
  const openBraces = (text.match(/\{\{/g) || []).length;
  const closeBraces = (text.match(/\}\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Unbalanced braces: make sure each {{ has a matching }}');
  }

  // Check for invalid cloze format
  const invalidCloze = text.match(/\{\{c[^0-9]/g);
  if (invalidCloze) {
    errors.push(
      `Invalid cloze format: ${invalidCloze.join(', ')} - use {{c1::answer}} format`
    );
  }

  // Check for missing answers
  const emptyCloze = text.match(/\{\{c\d+::\}\}/g);
  if (emptyCloze) {
    errors.push(`Empty cloze fields found: ${emptyCloze.join(', ')}`);
  }

  // Check for duplicate cloze IDs
  const clozeIds = text.match(/\{\{c(\d+)::/g);
  if (clozeIds) {
    const ids = clozeIds.map((id) => parseInt(id.replace(/\{\{c/, '').replace('::', '')));
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      errors.push('Duplicate cloze IDs detected - each cloze must have a unique ID');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate all study cards from a cloze data
 * Each cloze field becomes a separate study card
 * @param data - Parsed cloze data
 * @returns Array of field IDs representing each study card
 *
 * @example
 * generateClozeCards({ original: "...", fields: [{id: "c1"}, {id: "c2"}] })
 * // Returns: ["c1", "c2"]
 */
export function generateClozeCards(data: ClozeData): string[] {
  return data.fields.map((f) => f.id);
}

/**
 * Get a human-readable label for a cloze field
 * @param fieldId - The field ID (e.g., "c1")
 * @returns A human-readable label (e.g., "Cloze 1")
 */
export function getClozeFieldLabel(fieldId: string): string {
  const num = parseInt(fieldId.replace('c', ''), 10);
  return `Cloze ${num}`;
}
