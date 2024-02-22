import { useGetGuildCategoriesQuery } from '../api/guildCategories/getGuildCategories';
import { useI18nContext } from '../i18n/i18n-react';
import { Select } from './Select';
import { SelectItem } from './Select';

export const GuildCategorySelect = ({
    value,
    onSelect,
}: {
    value?: string;
    onSelect: (id: string) => void;
}) => {
    const { LL } = useI18nContext();

    const { data } = useGetGuildCategoriesQuery();

    return (
        <Select
            className='w-full'
            required={true}
            value={value}
            onValueChange={onSelect}
            placeholder={LL.Selects.Placeholders.SelectCategory()}
        >
            {data?.map((gc) => (
                <SelectItem key={gc.id} value={gc.id}>
                    {gc.name}
                </SelectItem>
            ))}
        </Select>
    );
};
