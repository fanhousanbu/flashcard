/**
 * Caclulates the effective length of text by stripping:
 * 1. Cloze syntax: {{c1::answer::hint}} -> answer
 * 2. Markdown links: [text](url) -> text
 * 3. Markdown symbols: **, *, _, #, `, >
 * 4. URLs: http://... or https://...
 */
export function calculateEffectiveLength(text: string): number {
  if (!text) return 0;

  let processed = text;

  // 1. Strip Cloze syntax
  // Matches {{c\d+::answer}} or {{c\d+::answer::hint}}
  // We want to keep just the 'answer' part.
  processed = processed.replace(/\{\{c\d+::(.*?)(::.*?)?\}\}/g, '$1');

  // 2. Strip Horizontal Rules (---, ***, ___) (Must be before bold/italic)
  processed = processed.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, '');

  // 3. Strip Lists (Must be before bold/italic)
  // Unordered (*, -, +) at start of line
  processed = processed.replace(/^[\s]*[-*+]\s+/gm, '');
  // Ordered (1., 2.) at start of line
  processed = processed.replace(/^[\s]*\d+\.\s+/gm, '');

  // 4. Strip Images (must be before links)
  // ![alt](url) -> alt
  processed = processed.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  
  // 5. Strip Strikethrough
  // ~~text~~ -> text
  processed = processed.replace(/~~(.*?)~~/g, '$1');

  // 2. Strip Markdown Links
  // Matches [text](url) -> text
  processed = processed.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 3. Strip URLs (raw links not in markdown format)
  // Simple regex for http/https
  processed = processed.replace(/(https?:\/\/[^\s]+)/g, '');

  // 4. Strip Common Markdown Symbols
  // Bold/Italic (** or *)
  processed = processed.replace(/(\*\*|__)(.*?)\1/g, '$2');
  processed = processed.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // Headers (#)
  processed = processed.replace(/^#+\s+/gm, '');
  
  // Blockquotes (>)
  processed = processed.replace(/^>\s+/gm, '');
  
  // Code blocks/Inline code (``` or `)
  processed = processed.replace(/`{1,3}(.*?)`{1,3}/g, '$1');



  // Trim whitespace
  return processed.trim().length;
}
