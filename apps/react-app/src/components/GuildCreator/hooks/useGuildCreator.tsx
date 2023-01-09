import { useCallback } from 'react';
import { useGuildCreatorStore } from '../stores/useGuildCreatorStore';

export const useGuildCreator = () => {
  const name = useGuildCreatorStore(useCallback((s) => s.name, []));
  const guildCategoryId = useGuildCreatorStore(useCallback((s) => s.guildCategoryId, []));
  const isDiscoverable = useGuildCreatorStore(useCallback((s) => s.isDiscoverable, []));
  const isNameValid = name.trim().length !== 0;
  const isGuildCategoryValid = typeof guildCategoryId === 'string';
  return { name, guildCategoryId, isDiscoverable, isNameValid, isGuildCategoryValid };
};
