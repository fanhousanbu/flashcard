import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import * as db from '../../../lib/supabase/database';
import type { Tag } from '../../../lib/types/tag';

export function useTags() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTags = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const data = await db.getUserTags(userId);
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const createTag = async (name: string, color: string) => {
    if (!userId) return;
    
    try {
      const newTag = await db.createTag({ user_id: userId, name, color });
      setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
      return newTag;
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  };

  const updateTag = async (tagId: string, updates: { name?: string; color?: string }) => {
    try {
      const updated = await db.updateTag(tagId, updates);
      setTags(prev => prev.map(t => t.id === tagId ? updated : t).sort((a, b) => a.name.localeCompare(b.name)));
      return updated;
    } catch (error) {
      console.error('Failed to update tag:', error);
      throw error;
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      await db.softDeleteTag(tagId);
      setTags(prev => prev.filter(t => t.id !== tagId));
    } catch (error) {
      console.error('Failed to delete tag:', error);
      throw error;
    }
  };

  return {
    tags,
    loading,
    createTag,
    updateTag,
    deleteTag,
    loadTags,
  };
}

