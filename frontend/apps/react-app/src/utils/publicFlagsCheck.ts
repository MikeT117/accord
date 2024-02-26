export const publicFlagsCheck = (flags: number, offset: number) => {
    return (flags & (1 << offset)) !== 0;
};
