/* tslint:disable */
/* eslint-disable */
/**
 * Manages network simulation by executing nodes and propagating packets between them
 */
export class Engine {
  free(): void;
  /**
   * @param {bigint} propagation_delay
   * @param {bigint} transmission_rate
   */
  constructor(propagation_delay: bigint, transmission_rate: bigint);
  /**
   * @returns {EngineState}
   */
  getState(): EngineState;
  /**
   * @param {number} id
   * @param {bigint} cycles_per_tick
   * @param {bigint} cycle_offset
   * @param {bigint} micros_per_tick
   */
  addTschNode(id: number, cycles_per_tick: bigint, cycle_offset: bigint, micros_per_tick: bigint): void;
  step(): void;
  /**
   * @param {bigint} cycles
   */
  run(cycles: bigint): void;
}
export class EngineState {
  free(): void;
  readonly cycle: bigint;
  readonly node_states: (NodeState)[];
}
export class NodeState {
  free(): void;
  readonly id: number;
  readonly local_cycle: bigint;
  readonly local_time: number;
  readonly task_names: any;
  readonly task_schedule: any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_engine_free: (a: number, b: number) => void;
  readonly engine_new: (a: number, b: number) => number;
  readonly engine_getState: (a: number) => number;
  readonly engine_addTschNode: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly engine_step: (a: number) => void;
  readonly engine_run: (a: number, b: number) => void;
  readonly __wbg_enginestate_free: (a: number, b: number) => void;
  readonly enginestate_cycle: (a: number) => number;
  readonly enginestate_node_states: (a: number) => Array;
  readonly __wbg_nodestate_free: (a: number, b: number) => void;
  readonly nodestate_id: (a: number) => number;
  readonly nodestate_local_cycle: (a: number) => number;
  readonly nodestate_local_time: (a: number) => number;
  readonly nodestate_task_names: (a: number) => number;
  readonly nodestate_task_schedule: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
