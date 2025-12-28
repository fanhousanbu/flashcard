export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  deleted_at: string | null;
}

export interface CardTag {
  id: string;
  card_id: string;
  tag_id: string;
  created_at: string;
}

export interface TagWithCount extends Tag {
  cardCount: number;
}

// Preset tag colors
export const TAG_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Orange', value: '#F97316' },
] as const;

export type TagColor = typeof TAG_COLORS[number]['value'];

