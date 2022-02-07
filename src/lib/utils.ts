import { Converter } from "@iota/util.js";

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