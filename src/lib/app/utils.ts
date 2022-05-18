import { browser } from '$app/env'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

function toUTF8Array(str) {
    const utf8 = []
    for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i)
        if (charcode < 0x80) utf8.push(charcode)
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f))
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f))
        }
        // surrogate pair
        else {
            i++
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
            utf8.push(
                0xf0 | (charcode >> 18),
                0x80 | ((charcode >> 12) & 0x3f),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f)
            )
        }
    }
    return utf8
}

function arrayBufferToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
}

export const createJsonDataUrl = (object: unknown): string => {
    const b64string = toUTF8Array(JSON.stringify(object, undefined, '\t'))
    const b64 = arrayBufferToBase64(b64string)
    return `data:application/json;base64,${b64}`
}

export const syntaxHighlight = (json: string): string => {
    return json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(
            // eslint-disable-next-line max-len
            /("(\\u[\dA-Za-z]{4}|\\[^u]|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[Ee][+-]?\d+)?)/g,
            (match) => {
                let cls = 'number'
                if (match.startsWith('"')) {
                    cls = match.endsWith(':') ? 'key' : 'string'
                } else if (/true|false/.test(match)) {
                    cls = 'boolean'
                } else if (match.includes('null')) {
                    cls = 'null'
                }
                return `<span class="${cls}">${match}</span>`
            }
        )
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

export function isAnObject(object: unknown): boolean {
    return object !== null && typeof object === 'object'
}

export function isArray(array: unknown): boolean {
    return Array.isArray(array)
}

export function isAnArrayOfObjects(array: unknown[]): boolean {
    return isArray(array) && array.every(isAnObject)
}

export function generateRandomId(): string {
    var d = new Date().getTime() //Timestamp
    var d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0 //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 //random number between 0 and 16
        if (d > 0) {
            //Use timestamp until depleted
            r = (d + r) % 16 | 0
            d = Math.floor(d / 16)
        } else {
            //Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0
            d2 = Math.floor(d2 / 16)
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
}
