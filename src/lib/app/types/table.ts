import type { BoxColor } from "$lib/app/constants/colors";
import type { Color } from "sveltestrap/src/shared";

export interface TableData {
    headings: string[];
    rows: {
        onClick: () => void;
        content: {
            icon?: string;
            boxColor?: BoxColor;
            value?: string[] | string;
            pills?: {
                color: Color,
                text: string,
            }[]
        }[]
    }[]
}

export interface TableConfiguration {
    isPaginated?: boolean;
    siblingsCount?: number;
    pageSize?: number;
}
