import { browser } from "$app/env";
import { writable } from "svelte/store";

export const jwt = writable(
    browser && (localStorage.getItem("jwt") || "test")
);
jwt.subscribe((val) => browser && (localStorage.jwt = val));
