import type { BoxColor } from "$lib/app/constants/colors";
import type { Color } from "sveltestrap/src/shared";

// TODO: Add missing pill|badge compatibility
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

