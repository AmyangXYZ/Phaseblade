/* tslint:disable */
/* eslint-disable */
export class Engine {
  free(): void;
  constructor();
  /**
   * @returns {any}
   */
  getState(): any;
  /**
   * @param {any} config
   */
  addNode(config: any): void;
  step(): void;
  /**
   * @param {bigint} cycles
   */
  run(cycles: bigint): void;
}
export class EngineState {
  free(): void;
  readonly cycle: bigint;
  readonly nodes: any[];
}
export class NodeConfig {
  free(): void;
  /**
   * @param {number} id
   * @param {string} unit_type
   * @param {Float64Array} position
   * @param {bigint} cpu_freq_hz
   * @param {bigint} tick_interval
   * @param {bigint} cycle_offset
   * @param {number} clock_drift_factor
   * @param {any[]} tasks
   */
  constructor(id: number, unit_type: string, position: Float64Array, cpu_freq_hz: bigint, tick_interval: bigint, cycle_offset: bigint, clock_drift_factor: number, tasks: any[]);
}
export class NodeState {
  free(): void;
  readonly id: number;
  readonly local_cycle: bigint;
  readonly local_time: number;
  readonly position: Float64Array;
  readonly task_schedule: (string)[];
  readonly unit_type: string;
}
export class TaskConfig {
  free(): void;
  /**
   * @param {number} id
   * @param {string} name
   * @param {number} priority
   */
  constructor(id: number, name: string, priority: number);
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_engine_free: (a: number, b: number) => void;
  readonly engine_new: () => number;
  readonly engine_getState: (a: number) => number;
  readonly engine_addNode: (a: number, b: number) => void;
  readonly engine_step: (a: number) => void;
  readonly engine_run: (a: number, b: number) => void;
  readonly __wbg_nodeconfig_free: (a: number, b: number) => void;
  readonly nodeconfig_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => number;
  readonly taskconfig_new: (a: number, b: number, c: number, d: number) => number;
  readonly __wbg_enginestate_free: (a: number, b: number) => void;
  readonly enginestate_cycle: (a: number) => number;
  readonly enginestate_nodes: (a: number, b: number) => void;
  readonly __wbg_nodestate_free: (a: number, b: number) => void;
  readonly nodestate_id: (a: number) => number;
  readonly nodestate_position: (a: number, b: number) => void;
  readonly nodestate_unit_type: (a: number, b: number) => void;
  readonly nodestate_local_cycle: (a: number) => number;
  readonly nodestate_local_time: (a: number) => number;
  readonly nodestate_task_schedule: (a: number, b: number) => void;
  readonly __wbg_taskconfig_free: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
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
