import { useMemo, useState } from 'react';
import { useGetRelationshipsQuery } from '../api/relationships/getRelationships';

export const useFilteredRelationships = ({ status }: { status: 0 | 1 | 2 }) => {
  const [displayNameFilter, setDisplayNameFilter] = useState('');
  const { data } = useGetRelationshipsQuery();
  const relationships = useMemo(
    () =>
      data?.filter((r) =>
        displayNameFilter && displayNameFilter.trim().length !== 0
          ? r.user.displayName
              .toLocaleLowerCase()
              .includes(displayNameFilter.toLocaleLowerCase()) && r.status === status
          : r.status === status,
      ) ?? [],
    [status, displayNameFilter, data],
  );

  return { relationships, displayNameFilter, setDisplayNameFilter };
};
