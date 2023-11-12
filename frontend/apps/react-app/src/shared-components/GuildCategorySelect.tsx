import { useGetGuildCategoriesQuery } from '@/api/guilds/getGuildCategories';
import { Select } from './Select';
import { SelectItem } from './Select';

export const GuildCategorySelect = ({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (id: string) => void;
}) => {
  const { data } = useGetGuildCategoriesQuery();
  return (
    <Select
      className='w-full'
      required={true}
      value={value}
      onValueChange={onSelect}
      placeholder='Select a category'
    >
      {data?.map((gc) => (
        <SelectItem key={gc.id} value={gc.id}>
          {gc.name}
        </SelectItem>
      ))}
    </Select>
  );
};
