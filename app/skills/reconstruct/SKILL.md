---
name: reconstruct
description: Reverse engineer a target component or subsystem and synthesize clean-room source code to rebuild it with verified feature parity.
---

# Reconstruct a component or subsystem

The user wants to rebuild or clone a component, feature, or complete application from the open binary or app into clean, modern source code (such as Swift, TypeScript, Rust, C++, or Python).

## Core Rules for Reconstructions

1. **Separate Project Directory (Never inside Unravel)**:
   - Never write reconstructed source files inside the Unravel repository (`eleven-main`).
   - Always create a dedicated project directory outside Unravel, defaulting to `~/Developer/<TargetName>` (or a path explicitly requested by the user).
   
2. **Launchable App Delivery (Not just raw code)**:
   - Do not stop at writing raw source files. The user wants to launch the reconstructed application directly as a native app.
   - For macOS targets: generate a `Package.swift`, source files, and a `build-app.sh` script that compiles a release build, packages a signed `.app` bundle with `Info.plist`, and installs it to `/Applications/<TargetName>.app`.
   - Launch and verify the finished `.app` bundle.

## Reconstruction Playbook

### 1. Map the Subsystem Perimeter
- Identify the subsystem entry points or public API using `search_procedures`, `list_strings`, or `xrefs`.
- Call `open_function` on the primary entry point to show it to the user.
- Enumerate the functions that belong to this subsystem using `procedure_callees`.

### 2. Recover Data Structures and Memory Layouts
- Inspect struct access offsets and pointer dereferences in `procedure_pseudo_code` and `procedure_assembly`.
- Reconstruct the data types, structs, enums, and state machines needed by the subsystem.
- Write these clean data definitions first, documenting field offsets and types.

### 3. Synthesize Clean-Room Source Code
- Translate the decompiled control flow and math into idiomatic, human-written code:
  - Eliminate compiler-specific register artifacts, stack spills, and manual pointer arithmetic.
  - Name variables according to their observed semantic role.
  - Separate platform I/O from core algorithmic logic.
  - Annotate any reverse-engineered magic numbers, lookup tables, or bitwise operations with comments.
- As you understand each function, call `rename_function` to assign meaningful C names and `add_note` to record its role in Unravel's project.

### 4. Build, Package, and Report
1. **Target Location**: Confirm the standalone project directory at `~/Developer/<TargetName>`.
2. **App Delivery**: Compile and package the native application (e.g. `build/<TargetName>.app`), install it to `/Applications/<TargetName>.app`, and launch it.
3. **CONCLUSION**: Summary of how the subsystem works, its architecture, and how the rebuilt version achieves parity.
4. **EVIDENCE**: Bulleted links citing every verified binary artifact:
   - `[Function](unravel://procedure/<name>)` at `0x<address>`
   - `[Instruction / Logic](unravel://address/<address>)`
   - `[Cross-Reference](unravel://xref/<address>)`
   - `[String / Constant](unravel://string/<address>)`
5. **CONFIDENCE**: High, Medium, or Low with a sentence on algorithmic verification coverage.
