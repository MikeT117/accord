import * as React from 'react';

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
    ({ className, ...props }, ref) => (
        <div className='relative w-full overflow-auto'>
            <table
                ref={ref}
                className={`border-collapse w-full caption-bottom text-sm ${className}`}
                {...props}
            />
        </div>
    ),
);

Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={`sticky top-0 ${className}`} {...props} />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={`overflow-y-auto overflow-x-hidden [&_tr:last-child]:border-0 ${className}`}
        {...props}
    />
));
TableBody.displayName = 'TableBody';

export const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={`border-t bg-muted/50 font-medium [&>tr]:last:border-b-0 border-grayA-4 ${className}
    `}
        {...props}
    />
));
TableFooter.displayName = 'TableFooter';

export const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={`border-b transition-colors border-grayA-4 hover:bg-grayA-2 ${className}`}
        {...props}
    />
));
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={`h-10 p-4 text-left align-middle font-medium ${className}`}
        {...props}
    />
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td ref={ref} className={`p-4 align-middle ${className}`} {...props} />
));
TableCell.displayName = 'TableCell';

export const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption ref={ref} className={`mt-4 text-sm ${className}`} {...props} />
));
TableCaption.displayName = 'TableCaption';
