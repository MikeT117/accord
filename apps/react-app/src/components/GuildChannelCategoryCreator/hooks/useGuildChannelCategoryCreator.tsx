import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGuildChannelCategoryCreatorStore } from '../stores/useGuildChannelCategoryCreatorStore';

export const useGuildChannelCategoryCreator = () => {
  const { guildId = '' } = useParams();
  const stage = useGuildChannelCategoryCreatorStore(useCallback((s) => s.stage, []));
  const name = useGuildChannelCategoryCreatorStore(useCallback((s) => s.name, []));
  const isPrivate = useGuildChannelCategoryCreatorStore(useCallback((s) => s.isPrivate, []));
  const roles = useGuildChannelCategoryCreatorStore(useCallback((s) => s.roles, []));
  const isNameValid = name.length !== 0;

  return { guildId, stage, name, isPrivate, roles, isNameValid };
};
