export type Card = {
  id: string;
  deck_id: string;
  front_content: string;
  back_content: string;
  position: number;
  created_at: string;
  deleted_at: string | null;
};

export type CardInput = {
  front_content: string;
  back_content: string;
  position: number;
};

