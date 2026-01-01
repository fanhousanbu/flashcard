import { describe, it, expect } from 'vitest';
import { calculateEffectiveLength } from './textHelpers';

describe('calculateEffectiveLength', () => {
  it('should return length of plain text', () => {
    expect(calculateEffectiveLength('hello world')).toBe(11);
  });

  it('should strip cloze syntax', () => {
    // {{c1::answer}} -> answer (6 chars)
    expect(calculateEffectiveLength('{{c1::answer}}')).toBe(6);
    // {{c1::answer::hint}} -> answer (6 chars)
    expect(calculateEffectiveLength('{{c1::answer::hint}}')).toBe(6);
    // Prefix {{c1::answer}} suffix -> Prefix answer suffix
    // 7 + 6 + 7 = 20
    expect(calculateEffectiveLength('Prefix {{c1::answer}} suffix')).toBe(20);
  });

  it('should strip markdown links', () => {
    // [link](http://example.com) -> link (4 chars)
    expect(calculateEffectiveLength('[link](http://example.com)')).toBe(4);
  });

  it('should strip raw URLs', () => {
    // Check out https://example.com -> Check out (9 chars + trimmed space? logic trims result)
    // "Check out " -> "Check out" (9)
    expect(calculateEffectiveLength('Check out https://example.com')).toBe(9);
  });

  it('should strip markdown symbols', () => {
    // **bold** -> bold (4)
    expect(calculateEffectiveLength('**bold**')).toBe(4);
    // *italic* -> italic (6)
    expect(calculateEffectiveLength('*italic*')).toBe(6);
    // # Header -> Header (6)
    expect(calculateEffectiveLength('# Header')).toBe(6);
    // `code` -> code (4)
    expect(calculateEffectiveLength('`code`')).toBe(4);
  });

  it('should handle complex combinations', () => {
    // **Hello** [world](url) {{c1::answer}}
    // Hello (5) + space + world (5) + space + answer (6) = 18
    expect(calculateEffectiveLength('**Hello** [world](url) {{c1::answer}}')).toBe(18);
  });

  it('should strip markdown lists', () => {
    expect(calculateEffectiveLength('- item')).toBe(4);
    expect(calculateEffectiveLength('* item')).toBe(4);
    expect(calculateEffectiveLength('1. item')).toBe(4);
  });

  it('should strip strikethrough', () => {
    expect(calculateEffectiveLength('~~deleted~~')).toBe(7);
  });

  it('should handle images', () => {
    // Should probably just count the alt text or treat as 0? 
    // Usually images are content, so alt text length seems appropriate.
    // The ! should be stripped.
    expect(calculateEffectiveLength('![image](url)')).toBe(5);
  });

  it('should strip horizontal rules', () => {
    expect(calculateEffectiveLength('---')).toBe(0);
  });

  it('should handle chinese characters in cloze', () => {
    expect(calculateEffectiveLength('{{c1::答案}}')).toBe(2);
  });
});
