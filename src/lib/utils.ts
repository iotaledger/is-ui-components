import { browser } from "$app/env";
import { Converter } from "@iota/util.js";
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

export const createJsonDataUrl = (object: unknown): string => {
    const b64 = Converter.bytesToBase64(Converter.utf8ToBytes((JSON.stringify(object, undefined, "\t"))));
    return `data:application/json;base64,${b64}`;
}

export const syntaxHighlight = (json: string): string => {
    return json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(
            // eslint-disable-next-line max-len
            /("(\\u[\dA-Za-z]{4}|\\[^u]|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[Ee][+-]?\d+)?)/g,
            match => {
                let cls = "number";
                if (match.startsWith('"')) {
                    cls = match.endsWith(":") ? "key" : "string";
                } else if (/true|false/.test(match)) {
                    cls = "boolean";
                } else if (match.includes("null")) {
                    cls = "null";
                }
                return `<span class="${cls}">${match}</span>`;
            }
        );
}

/**
 * Persist a writable Svelte store to local storage
 */
export const persistent = <T>(key: string, initialValue: T): Writable<T> => {
    if (browser) {
        let value = initialValue

        try {
            const json = localStorage.getItem(key)
            if (json) {
                value = JSON.parse(json)
            }
        } catch (err) {
            console.error(err)
        }

        const state = writable(value)

        state.subscribe(($value): void => {
            if ($value === undefined || $value === null) {
                localStorage.removeItem(key)
            } else {
                localStorage.setItem(key, JSON.stringify($value))
            }
        })

        return state
    }
}

export function isJson(str: string): boolean {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}