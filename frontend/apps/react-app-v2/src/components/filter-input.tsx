import { SearchIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { ChangeEvent } from "react";

type FilterInputProps = {
    filterValue: string;
    onChange: (value: string) => void;
    resultsCount: number;
    className?: string;
    placeholder?: string;
};

export function FilterInput({ filterValue, onChange, resultsCount, className, placeholder }: FilterInputProps) {
    function handleChange(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        onChange(e.currentTarget.value);
    }
    return (
        <InputGroup>
            <InputGroupInput
                placeholder={placeholder ?? "Search..."}
                value={filterValue}
                onChange={(e) => handleChange(e)}
                className={className}
            />
            <InputGroupAddon>
                <SearchIcon />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">{resultsCount} results</InputGroupAddon>
        </InputGroup>
    );
}
