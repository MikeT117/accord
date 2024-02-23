import React, { memo } from 'react';
import { useParseContent } from './hooks/useParseContent';

export const MessageContent = memo(({ content }: { content: string }) => {
    const contentArray = useParseContent(content);

    if (contentArray.length === 1 && typeof contentArray[0] !== 'string') {
        return React.cloneElement(contentArray[0], { className: 'inline h-12 w-12' });
    }

    return (
        <div className='text-sm text-gray-12'>
            {contentArray.map((contentItem, i) =>
                typeof contentItem === 'string' ? <span key={i}>{contentItem}</span> : contentItem,
            )}
        </div>
    );
});
