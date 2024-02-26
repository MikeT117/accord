import { useState } from 'react';
import { useGetRelationshipsQuery } from '../../../../api/userRelationships/getRelationships';

export const useFilteredRelationships = (status: number) => {
    const [filter, setFilter] = useState('');
    const { data, isLoading } = useGetRelationshipsQuery(status, filter);
    return { data, isLoading, filter, setFilter };
};
