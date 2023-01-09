import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGuildChannelCreatorStore } from '../stores/useGuildChannelCreatorStore';

export const useGuildChannelCreator = () => {
  const { guildId = '' } = useParams();

  const stage = useGuildChannelCreatorStore(useCallback((s) => s.stage, []));
  const name = useGuildChannelCreatorStore(useCallback((s) => s.name, []));
  const topic = useGuildChannelCreatorStore(useCallback((s) => s.topic, []));
  const isPrivate = useGuildChannelCreatorStore(useCallback((s) => s.isPrivate, []));
  const roles = useGuildChannelCreatorStore(useCallback((s) => s.roles, []));
  const type = useGuildChannelCreatorStore(useCallback((s) => s.type, []));
  const isNameValid = name.length !== 0;

  return {
    guildId,
    stage,
    name,
    topic,
    isPrivate,
    roles,
    type,
    isNameValid,
  };
};
