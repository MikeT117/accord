import emoji from 'react-easy-emoji';

export const useParseContent = (content: string) => {
    return (() =>
        emoji(content, (code: string, alt: string, offset) => (
            <img
                key={offset}
                className='inline h-5 w-5 mx-0.5'
                src={`https://twemoji.maxcdn.com/2/svg/${code}.svg`}
                alt={alt}
            />
        )))();
};
