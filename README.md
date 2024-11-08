# Phaseblade <img src="./phaseblade.png" align="top" alt="Phaseblade Logo" height="36">

A deterministic real-time wireless network simulator designed for evaluating TDMA protocols and time synchronization in challenging environments. Built with Rust for high-performance node simulation (each running as independent thread with configurable clock drift), standard TCP/JSON for UI communication, and React/BabylonJS for 3D visualization. Phaseblade enables precise analysis of timing behaviors in wireless data transfer scenarios, making it ideal for studying network resilience and protocol performance under various field conditions.

## System Architecture

```
Internal Simulation (Rust)                      External UI
+---------------+                          +------------------+
|  Node Thread  |                          |                  |
|    (Rust)     | ----channel-+            |  React/BabylonJS |
+---------------+             |            |        UI        |
                              v            |                  |
+---------------+     +--------------+     |                  |
|  Node Thread  | --> | Orchestrator | --> |     TCP/JSON     |
|    (Rust)     | --> | - UI Bridge  | --> |    Connection    |
+---------------+     +--------------+     |                  |
                              ^            |                  |
+---------------+             |            |                  |
|  Node Thread  | ----channel-+            |                  |
|    (Rust)     |                          |                  |
+---------------+                          +------------------+

```

Core Flow:

1. Independent nodes run as Rust threads
2. Nodes exchange packets via channels through coordinator
3. Coordinator simulates wireless conditions (delay/loss)
4. UI receives network state via TCP/JSON

## Platform Vision

Phaseblade aims to be a modern network simulation platform that enables:

- Protocol research and rapid prototyping
- Time-critical wireless network evaluation
- Real-time visualization and analysis
- Reproducible network experiments

## Features & Roadmap

Core Platform [WIP]:

- [ ] Thread-based node runtime with independent clocks
- [ ] Channel-based communication framework
- [ ] Event-driven simulation engine
- [ ] Configurable network environment
- [ ] Real-time 3D visualization via TCP/JSON

Time-Sensitive Networking:

- [ ] 802.1Qbv Time-Aware Shaper
- [ ] 802.1CB Frame Replication and Elimination
- [ ] 802.1AS-like Time Synchronization
- [ ] Gate Control List scheduling
- [ ] Stream reservation

Protocol Development:

- [ ] Base protocol primitives
- [ ] Protocol configuration interface
- [ ] Flexible packet structure
- [ ] Priority scheduling
- [ ] State machine framework

Security & Reliability:

- [ ] Custom encryption integration
- [ ] Authentication mechanisms
- [ ] Message integrity checks
- [ ] Redundancy management
- [ ] Security metrics collection

Network Research:

- [ ] Time accuracy measurement
- [ ] Performance metrics collection
- [ ] Scenario configuration
- [ ] Network condition simulation
- [ ] Experiment reproducibility

```

```
