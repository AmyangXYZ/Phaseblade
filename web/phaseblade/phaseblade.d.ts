/* tslint:disable */
/* eslint-disable */
/**
 * Manages network simulation by executing nodes and propagating packets between them
 */
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
  /**
   * @returns {any}
   */
  availableTasks(): any;
}
export class EngineState {
  free(): void;
  /**
   * @param {bigint} cycle
   * @param {(NodeState)[]} nodes
   * @returns {EngineState}
   */
  static new(cycle: bigint, nodes: (NodeState)[]): EngineState;
  readonly cycle: bigint;
  readonly nodes: (NodeState)[];
}
export class NodeConfig {
  free(): void;
  /**
   * @param {number} id
   * @param {Float64Array} position
   * @param {string} unit_type
   * @param {bigint} cpu_freq_hz
   * @param {bigint} tick_interval
   * @param {bigint} cycle_offset
   * @param {number} clock_drift_factor
   * @param {(TaskConfig)[]} tasks
   */
  constructor(id: number, position: Float64Array, unit_type: string, cpu_freq_hz: bigint, tick_interval: bigint, cycle_offset: bigint, clock_drift_factor: number, tasks: (TaskConfig)[]);
  clock_drift_factor: number;
  cpu_freq_hz: bigint;
  cycle_offset: bigint;
  id: number;
  tick_interval: bigint;
}
export class NodeState {
  free(): void;
  id: number;
  local_cycle: bigint;
  local_time: number;
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
  id: number;
  readonly name: string;
  priority: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_nodeconfig_free: (a: number, b: number) => void;
  readonly __wbg_get_nodeconfig_id: (a: number) => number;
  readonly __wbg_set_nodeconfig_id: (a: number, b: number) => void;
  readonly __wbg_get_nodeconfig_cpu_freq_hz: (a: number) => number;
  readonly __wbg_set_nodeconfig_cpu_freq_hz: (a: number, b: number) => void;
  readonly __wbg_get_nodeconfig_tick_interval: (a: number) => number;
  readonly __wbg_set_nodeconfig_tick_interval: (a: number, b: number) => void;
  readonly __wbg_get_nodeconfig_cycle_offset: (a: number) => number;
  readonly __wbg_set_nodeconfig_cycle_offset: (a: number, b: number) => void;
  readonly __wbg_get_nodeconfig_clock_drift_factor: (a: number) => number;
  readonly __wbg_set_nodeconfig_clock_drift_factor: (a: number, b: number) => void;
  readonly nodeconfig_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => number;
  readonly __wbg_nodestate_free: (a: number, b: number) => void;
  readonly __wbg_get_nodestate_id: (a: number) => number;
  readonly __wbg_set_nodestate_id: (a: number, b: number) => void;
  readonly __wbg_get_nodestate_local_time: (a: number) => number;
  readonly __wbg_set_nodestate_local_time: (a: number, b: number) => void;
  readonly nodestate_position: (a: number) => Array;
  readonly nodestate_unit_type: (a: number) => Array;
  readonly nodestate_task_schedule: (a: number) => Array;
  readonly __wbg_get_nodestate_local_cycle: (a: number) => number;
  readonly __wbg_set_nodestate_local_cycle: (a: number, b: number) => void;
  readonly __wbg_engine_free: (a: number, b: number) => void;
  readonly engine_new: () => number;
  readonly engine_getState: (a: number) => number;
  readonly engine_addNode: (a: number, b: number) => void;
  readonly engine_step: (a: number) => void;
  readonly engine_run: (a: number, b: number) => void;
  readonly engine_availableTasks: (a: number) => number;
  readonly __wbg_enginestate_free: (a: number, b: number) => void;
  readonly enginestate_new: (a: number, b: number, c: number) => number;
  readonly enginestate_cycle: (a: number) => number;
  readonly enginestate_nodes: (a: number) => Array;
  readonly __wbg_taskconfig_free: (a: number, b: number) => void;
  readonly __wbg_get_taskconfig_id: (a: number) => number;
  readonly __wbg_set_taskconfig_id: (a: number, b: number) => void;
  readonly __wbg_get_taskconfig_priority: (a: number) => number;
  readonly __wbg_set_taskconfig_priority: (a: number, b: number) => void;
  readonly taskconfig_new: (a: number, b: number, c: number, d: number) => number;
  readonly taskconfig_name: (a: number) => Array;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
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
