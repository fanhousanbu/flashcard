import { supabase } from './client';

const AVATARS_BUCKET = 'avatars';
const CARD_IMAGES_BUCKET = 'card-images';

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function uploadCardImage(deckId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${deckId}-${Date.now()}.${fileExt}`;
  const filePath = `${deckId}/${fileName}`;

  const { error } = await supabase.storage
    .from(CARD_IMAGES_BUCKET)
    .upload(filePath, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(CARD_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function deleteFile(bucket: string, filePath: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
}

