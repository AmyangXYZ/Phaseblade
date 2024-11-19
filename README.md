# Phaseblade

A deterministic real-time network simulator built around a cycle-accurate time-triggered execution model. The simulation engine orchestrates network nodes through precise cycle counts, with each node implementing an RTOS-like preemptive task scheduler that maps configurable cycle counts to local ticks. Nodes maintain independent local time with configurable drift factors, enabling precise evaluation of TDMA protocols and time synchronization algorithms through reproducible network experiments. The platform includes real-time visualization via a React/Electron UI.

## Key Advantages

### Implementation-Focused Design

- Cycle-accurate simulation engine with deterministic execution
- Priority-based preemptive task scheduling per node
- Configurable cycle-to-tick mapping for timing control
- Interactive protocol visualization and analysis

### Time Management

- **Cycles**: The fundamental timing unit broadcasted by the simulation engine

  - Represents the finest granularity of time in the system (e.g., 10ns @ 100MHz CPU)
  - Engine broadcasts atomic cycle counts to all nodes synchronously
  - Provides a deterministic and machine-independent timing base
  - Read-only by nodes and tasks, ensuring timing integrity
  - Each node has its own cycle offset to simulate asynchronous startup

- **Ticks**: Node-level scheduling unit that drives the RTOS task scheduler

  - Each node maps N cycles to 1 tick (configurable per node type)
  - Different nodes can have different cycle-to-tick mappings (e.g., 50, 100, 200)
  - Simulates precise hardware timer interrupts found in real RTOS
  - Triggers the task scheduler at exact cycle counts
  - Guarantees deterministic task scheduling with no drift
  - Ensures at most one task execution per cycle

- **Local Clock**: Node-level time representation that simulates real clock
  - Maintained independently by each node
  - Updated every cycle with a configurable drift factor
  - Can be adjusted by time synchronization protocols (e.g., TSCH MAC, 802.1AS)
  - Provides time reference for application tasks
  - Tasks can only access system time, not cycles or ticks
  - Starting point can be set to specific date/time

#### RTOS-like API Design

The core RTOS functionality is implemented through a set of composable traits:

- **Engine**: Central orchestrator that manages network simulation

  - Broadcasts cycle counts to all nodes
  - Handles packet propagation between nodes
  - Controls simulation timing and execution
  - Manages transmission delays and rates
  - Tracks in-transit packets

- **Node**: Network node with RTOS capabilities

  - Maps cycles to ticks for scheduling
  - Manages task execution and scheduling
  - Routes messages between tasks
  - Handles packet I/O
  - Clock drift applied for local time

- **Task**: Preemptable execution unit

  - Has unique ID and priority
  - Reports execution time for scheduling
  - Processes messages via priority-queue based mailbox
  - Produces messages as output
  - Default message handling implementation

- **Message**: Inter-task communication

  - Priority-based delivery
  - Source/destination task routing
  - Optional packet encapsulation
  - Stored in priority mailboxes
  - Ordered by message priority

- **Packet**: Network communication
  - Node-to-node delivery
  - Size and timing properties
  - Arrival time tracking
  - Managed by engine for propagation

## System Architecture

```
    Node 1                     Node 2
+-----------+              +-----------+
|   Tasks   |              |   Tasks   |
|  App (L)  |              |  App (L)  |
|  Net (N)  |              |  Net (N)  |
|  MAC (H)  |              |  MAC (H)  |
|  TDMA (C) |              |  TDMA (C) |
+-----------+              +-----------+
     ↑↓                         ↑↓
+-----------+              +-----------+
| Mailboxes |              | Mailboxes |
+-----------+              +-----------+
     ↑↓                         ↑↓
+-----------+              +-----------+
|  Packet   |              |  Packet   |
| I/O Queue |              | I/O Queue |
+-----------+              +-----------+
      |                          |
      |   +------------------+   |
      |   |     Engine       |   |
      |   | - Cycle Counter  |   |
      |   | - Packet Transit |   |
      |   | - Timing Control |   |
      |   +------------------+   |
      |            ↑↓            |
      +--------------------------+


          Node Internal (Detail)
        +-----------------------+
        |    Task Management    |
        | - Task Registry       |
        | - Priority Scheduling |
        | - Message Routing     |
        +-----------------------+
                  ↑↓
        +-----------------------+
        |    Tick Scheduler     |
        | - Cycle to Tick Map   |
        | - Execution Schedule  |
        | - Preemption Control  |
        +-----------------------+
                  ↑↓
        +-----------------------+
        |   System Time & I/O   |
        | - Local Clock w/Drift |
        | - Packet Queues       |
        | - Resource Control    |
        +-----------------------+
```

## Platform Vision

Phaseblade aims to be a modern network simulation platform that enables:

- Protocol research and rapid prototyping
- Time-critical wireless network evaluation
- Real-time visualization and analysis
- Reproducible network experiments

## Features & Roadmap

Core Platform [WIP]:

- [x] Cycle-based orchestration with node tick management
- [x] RTOS-like task scheduler with preemption
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
