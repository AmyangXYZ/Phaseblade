/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_engine_free(a: number, b: number): void;
export function engine_new(): number;
export function engine_getState(a: number): number;
export function engine_addNode(a: number, b: number): void;
export function engine_step(a: number): void;
export function engine_run(a: number, b: number): void;
export function __wbg_nodeconfig_free(a: number, b: number): void;
export function nodeconfig_new(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number): number;
export function taskconfig_new(a: number, b: number, c: number, d: number): number;
export function __wbg_enginestate_free(a: number, b: number): void;
export function enginestate_cycle(a: number): number;
export function enginestate_nodes(a: number, b: number): void;
export function __wbg_nodestate_free(a: number, b: number): void;
export function nodestate_id(a: number): number;
export function nodestate_position(a: number, b: number): void;
export function nodestate_unit_type(a: number, b: number): void;
export function nodestate_local_cycle(a: number): number;
export function nodestate_local_time(a: number): number;
export function nodestate_task_schedule(a: number, b: number): void;
export function __wbg_taskconfig_free(a: number, b: number): void;
export function __wbindgen_malloc(a: number, b: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number, d: number): number;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number, c: number): void;
export function __wbindgen_exn_store(a: number): void;
