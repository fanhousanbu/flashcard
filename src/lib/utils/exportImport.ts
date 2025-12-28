import type { Deck, Card } from '../types/deck';

export interface ExportData {
  deck: Omit<Deck, 'id' | 'user_id' | 'created_at' | 'deleted_at'>;
  cards: Omit<Card, 'id' | 'deck_id' | 'created_at' | 'deleted_at'>[];
}

export type ExportFormat = 'json' | 'csv';

export function exportDeck(deck: Deck, cards: Card[]): string {
  const exportData: ExportData = {
    deck: {
      name: deck.name,
      description: deck.description,
      is_public: deck.is_public,
    },
    cards: cards.map(card => ({
      front_content: card.front_content,
      back_content: card.back_content,
      position: card.position,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

export function exportDeckToCSV(_deck: Deck, cards: Card[]): string {
  // CSV header
  const header = 'Front,Back,Position\n';
  
  // CSV data rows
  const rows = cards
    .sort((a, b) => a.position - b.position)
    .map(card => {
      // Escape special characters for CSV
      const escapeCSV = (text: string) => {
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
          return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      };
      
      return `${escapeCSV(card.front_content)},${escapeCSV(card.back_content)},${card.position}`;
    })
    .join('\n');
  
  return header + rows;
}

export function downloadDeck(deck: Deck, cards: Card[], format: ExportFormat = 'json'): void {
  let content: string;
  let mimeType: string;
  let extension: string;
  
  if (format === 'csv') {
    content = exportDeckToCSV(deck, cards);
    mimeType = 'text/csv';
    extension = 'csv';
  } else {
    content = exportDeck(deck, cards);
    mimeType = 'application/json';
    extension = 'json';
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${deck.name}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportData(json: string): ExportData {
  try {
    const data = JSON.parse(json);
    
    if (!data.deck || !data.cards) {
      throw new Error('Invalid deck format');
    }

    if (!data.deck.name) {
      throw new Error('Deck name is required');
    }

    if (!Array.isArray(data.cards)) {
      throw new Error('Cards must be an array');
    }

    return data as ExportData;
  } catch (error) {
    throw new Error('Failed to parse import data: ' + (error as Error).message);
  }
}

export function parseCSVData(csv: string, deckName?: string): ExportData {
  const lines = csv.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }
  
  // Parse a CSV line (handling quotes and escapes)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip the next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };
  
  const header = parseCSVLine(lines[0]);
  const frontIndex = header.findIndex(h => h.toLowerCase().includes('正面') || h.toLowerCase().includes('front'));
  const backIndex = header.findIndex(h => h.toLowerCase().includes('背面') || h.toLowerCase().includes('back'));
  const positionIndex = header.findIndex(h => h.toLowerCase().includes('位置') || h.toLowerCase().includes('position'));
  
  if (frontIndex === -1 || backIndex === -1) {
    throw new Error('CSV must contain "Front" and "Back" columns');
  }
  
  const cards = lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line);
    return {
      front_content: values[frontIndex] || '',
      back_content: values[backIndex] || '',
      position: positionIndex >= 0 ? parseInt(values[positionIndex] || String(index), 10) : index,
    };
  });
  
  return {
    deck: {
      name: deckName || 'Imported Deck',
      description: '',
      is_public: false,
    },
    cards,
  };
}

export function previewImportData(data: ExportData): { deckName: string; cardCount: number; sampleCards: Array<{ front: string; back: string }> } {
  return {
    deckName: data.deck.name,
    cardCount: data.cards.length,
    sampleCards: data.cards.slice(0, 3).map(card => ({
      front: card.front_content.substring(0, 50),
      back: card.back_content.substring(0, 50),
    })),
  };
}

