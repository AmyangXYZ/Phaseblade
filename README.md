# Phaseblade

A deterministic real-time wireless network simulator designed for evaluating TDMA protocols and time synchronization in challenging environments. Built with Rust for high-performance node simulation (each running as independent thread with configurable clock drift), standard TCP/JSON for UI communication, and React/BabylonJS for 3D visualization. Phaseblade enables precise analysis of timing behaviors in wireless data transfer scenarios, making it ideal for studying network resilience and protocol performance under various field conditions.

## Key Advantages

### Implementation-Focused Design

- Cycle/Tick-accurate RTOS task scheduler for protocol stacks
- Priority-based preemptive multitasking
- Realistic timing and resource constraints
- Direct code portability to deployment targets
- Interactive protocol demonstration and validation

### Virtual Time Management

- Cycle-based synchronization:

  - Orchestrator broadcasts atomic cycle counts (finest granularity)
  - Each node maps N cycles to 1 local tick
  - Configurable N per node simulates clock drift (e.g., 99/100/101)
  - Variable cycle offsets simulate asynchronous node startup

- Node tick management:

  - Hardware timer abstraction via tick interrupts
  - Preemptive task scheduling based on ticks
  - Local time tracking with tick counter
  - Hard real-time task constraints (e.g., TDMA)

- Virtual time synchronization:

  - MAC layer maintains adjustable virtual clock
  - Time sync packets allow clock corrections
  - Maps local ticks to global TDMA schedule
  - Handles node time drift and skew compensation

- Deterministic behavior:
  - Machine-independent timing via cycle counts
  - Reproducible network experiments
  - Configurable time drift scenarios
  - Analyzable timing performance

### Digital Twin Capabilities

- Real-time protocol visualization
- Interactive parameter adjustment
- Live behavior demonstration
- Failure scenario injection
- System monitoring and analysis

## System Architecture

```
    Node 1                     Node 2
+-----------+              +-----------+
|    App    |              |    App    |
|   Stack   |              |   Stack   |
+-----------+              +-----------+
     ↑↓                         ↑↓
+-----------+              +-----------+
|    Net    |              |    Net    |
|   Stack   |              |   Stack   |
+-----------+              +-----------+
     ↑↓                         ↑↓
+-----------+              +-----------+
|    MAC    |              |    MAC    |
|   Stack   |              |   Stack   |
+-----------+              +-----------+
     ↑↓                         ↑↓
+-----------+              +-----------+
|    PHY    |              |    PHY    |
|   Stack   |              |   Stack   |
+-----------+              +-----------+
      |                          |
      |   +------------------+   |
      |   |   Orchestrator   |   |
      |   | (Cycle Counter)  |   |
      |   +------------------+   |
      |            ↑↓           |
      |   +------------------+  |
      +-> |  Cycle Broadcast | <+
          +------------------+

  Node Internal (Detail)
+------------------------+
|     Tick Scheduler     |
|  (N cycles = 1 tick)   |
+------------------------+
          ↑↓
+------------------------+
|    Priority Queue      |
|  Critical: MAC TDMA    |
|  High:    MAC Other    |
|  Normal:  Net Stack    |
|  Low:     App Stack    |
+------------------------+
          ↑↓
+------------------------+
|    Task Execution      |
|  - Preemption Support  |
|  - Cycle Counting      |
|  - Resource Control    |
+------------------------+
```

Core Flow:

1. Orchestrator broadcasts base cycles to all nodes
2. Each node maintains its own tick counter simulating clock drift:
   - Node A: 100 cycles = 1 tick (nominal)
   - Node B: 99 cycles = 1 tick (fast clock)
   - Node C: 101 cycles = 1 tick (slow clock)
3. RTOS tasks execute based on node ticks
4. UI receives network state via TCP/JSON

Example Timing:

```
Orchestrator: 1-2-3-4-5-6-7-8-9-... (base cycles)
Node A:       ↑       ↑       ↑     (tick every 100 cycles)
Node B:       ↑      ↑      ↑      (tick every 99 cycles)
Node C:         ↑       ↑       ↑   (tick every 101 cycles and with 1 offset)
```

## Platform Vision

Phaseblade aims to be a modern network simulation platform that enables:

- Protocol research and rapid prototyping
- Time-critical wireless network evaluation
- Real-time visualization and analysis
- Reproducible network experiments

## Features & Roadmap

Core Platform [WIP]:

- [ ] Cycle-based orchestration with node tick management
- [ ] RTOS-like task scheduler with preemption
- [ ] Priority-based protocol stack execution
- [ ] Configurable per-node clock drift simulation
- [ ] Real-time 3D visualization via TCP/JSON

Time-Sensitive Networking:

- [ ] TDMA slot management with drift compensation
- [ ] 802.1Qbv Time-Aware Shaper
- [ ] 802.1CB Frame Replication and Elimination
- [ ] 802.1AS-like Time Synchronization
- [ ] Gate Control List scheduling

Protocol Development:

- [ ] Task-based protocol implementation framework
- [ ] Cycle-accurate timing control
- [ ] Configurable execution timing
- [ ] Priority-based resource scheduling
- [ ] State machine framework

Security & Reliability:

- [ ] Custom encryption integration
- [ ] Authentication mechanisms
- [ ] Message integrity checks
- [ ] Redundancy management
- [ ] Security metrics collection

Network Research:

- [ ] Clock drift analysis
- [ ] Task execution timing measurement
- [ ] Protocol timing verification
- [ ] Network condition simulation
- [ ] Experiment reproducibility
