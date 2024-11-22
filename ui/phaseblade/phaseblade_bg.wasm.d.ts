/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_engine_free(a: number, b: number): void;
export function engine_new(a: number, b: number): number;
export function engine_getState(a: number): number;
export function engine_addTschNode(a: number, b: number, c: number, d: number, e: number): void;
export function engine_step(a: number): void;
export function engine_run(a: number, b: number): void;
export function __wbg_enginestate_free(a: number, b: number): void;
export function enginestate_cycle(a: number): number;
export function enginestate_node_states(a: number): Array;
export function __wbg_nodestate_free(a: number, b: number): void;
export function nodestate_id(a: number): number;
export function nodestate_local_cycle(a: number): number;
export function nodestate_local_time(a: number): number;
export function nodestate_task_names(a: number): number;
export function nodestate_task_schedule(a: number): number;
export function __wbindgen_malloc(a: number, b: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number, d: number): number;
export const __wbindgen_export_2: WebAssembly.Table;
export function __externref_drop_slice(a: number, b: number): void;
export function __wbindgen_free(a: number, b: number, c: number): void;
export function __wbindgen_start(): void;
