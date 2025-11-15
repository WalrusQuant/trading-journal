'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tag } from '../types';
import { storage } from '../storage';

interface TagContextType {
  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  getTag: (id: string) => Tag | undefined;
  getTagsByCategory: (category: string) => Tag[];
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export function TagProvider({ children }: { children: ReactNode }) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTags(storage.getTags());
  }, []);

  const addTag = (tagData: Omit<Tag, 'id'>) => {
    const tag: Tag = {
      ...tagData,
      id: `tag-${Date.now()}`,
    };

    storage.addTag(tag);
    setTags(storage.getTags());
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    storage.updateTag(id, updates);
    setTags(storage.getTags());
  };

  const deleteTag = (id: string) => {
    storage.deleteTag(id);
    setTags(storage.getTags());
  };

  const getTag = (id: string) => {
    return tags.find(t => t.id === id);
  };

  const getTagsByCategory = (category: string) => {
    return tags.filter(t => t.category === category);
  };

  if (!isClient) {
    return null;
  }

  return (
    <TagContext.Provider
      value={{
        tags,
        addTag,
        updateTag,
        deleteTag,
        getTag,
        getTagsByCategory,
      }}
    >
      {children}
    </TagContext.Provider>
  );
}

export function useTags() {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagProvider');
  }
  return context;
}
