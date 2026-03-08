---
type:
  - Specification
tags:
  - Portfolio
---
**Project:** Portfolio Architecture: High-Performance Physics & Canvas Animation
**Module:** System-Level Terminal Overlay (`Terminal.tsx`)
**Author:** Shakir Ahmed (MSc Physics Candidate, University of Cologne)
**Date:** February 16, 2026

## 1. Abstract

This document defines the architectural requirements for a hidden, functional Command-Line Interface (CLI) overlaying the primary 3D WebGL canvas. The terminal serves as a "diegetic" navigation tool, allowing users to interact with the portfolio's state using Unix-like syntax. This feature bridges the gap between the high-level visual abstraction of the portfolio (3D rendering) and the low-level computational reality of the user's expertise (Linux/MLOps).


![[Screenshot 2026-03-07 at 10.40.51 AM.png]]

## 2. Theoretical Framework & Data Structures

### 2.1 The Virtual File System (VFS) as a Tree Graph

The underlying data structure for the terminal is a **Tree**, defined as a graph  where  represents file nodes and  represents directory containment.

Let the root directory be defined as node . Any node  can be classified as:

* **Type  (Directory):** A node containing a set of child nodes .
* **Type  (File):** A leaf node containing a data payload  (text string or executable function).

The VFS state is serialized as a JSON object:

```json
{
  "root": {
    "home": {
		"resume.pdf": "LINK_TO_ASSET",
		"Resources": "files"
    },
    "bin": {
      "ls": "FUNCTION_REF",
      "cd": "FUNCTION_REF",
      "htop": "FUNCTION_REF",
      "open": "FUNCTION_REF",
      "help": "FUNCTION_REF",
      "sudo": "FUNCTION_REF"
    }
  }
}

```
The home folder is a real folder inside public directory which will mapped in the terminal json dynamically and recursively (as there can be either folder or files), with the functionality to open the files in a different tab of browser. The files there will be either html or pdf or text or image. 
### 2.2 Path Resolution Algorithm

Let  be the ordered list of directory nodes representing the current working directory.
When a navigation command is issued with argument :

1. If  begins with `/`, .
2. If  is relative, .
3. Validity check:  such that path to  corresponds to .

## 3. Algorithmic Logic & Tokenization

### 3.1 Lexical Analysis

User input is treated as a string . The parser must decompose  into tokens based on whitespace delimiter .

* : The executable command (key in `/bin`).
* : The target node or parameter.

### 3.2 Command Execution & Side Effects

The terminal is not isolated; it acts as a controller for the global application state.

| Command | Argument ()    | Logic Description                 | Application Side Effect                                                                                                                          |
| ------- | -------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cd`    | Directory Path | change directory according to VFS |                                                                                                                                                  |
| `ls`    | `[opt]`        | Iterates children of .            | Returns formatted string of keys in current JSON node.                                                                                           |
| `open`  | File Name      | Retreives payload  of node.       | open file in a new browser tab                                                                                                                   |
| `htop`  | `null`         | N/A                               | **Hooks into Three.js:** Returns `gl.info.render.calls`, `gl.info.memory.geometries` and FPS.                                                    |
| `help`  | `null`         | N/A                               | shows available commands with description                                                                                                        |
| `sudo`  | `null`         | N/A                               | asks for password (the password will be stored privately, perhaps with an encryption) and enter sudo mode with terminal prompt `[root@raven #]$` |


## 4. Visual Implementation (Shaders & DOM)

### 4.1 The "Quake" Visor Style

* **Trigger:** Global event listener on `Key: "T" .
* **Animation:** CSS `transform: translateY(-100%)` to `0%` with cubic-bezier easing to simulate mechanical slide.

### 4.2 CRT Post-Processing (GLSL)

To maintain the "System Administrator" aesthetic, the terminal container must use a custom fragment shader or CSS filter to simulate a Cathode Ray Tube monitor.

![[Screenshot 2026-03-07 at 10.40.51 AM.png]]

### 4.3 Typography

* **Font:** 'Fira Code' or 'JetBrains Mono' (Ligatures enabled).
* **Color Palette:**
* Text: `#00ff00` (Classic Terminal Green) 
* Prompt: `[user@raven ~]$`.

To make this feel like a real Linux machine and not just a toy:

- **Boot Sequence:** When the site first loads (or when the terminal opens), show a quick, fake `dmesg` boot log:
    
    Bash
    
    ```
    [ 0.000000] portfolio version 2.017-ravenwit-kernel (infinite iteration)
    [ 0.002481] Quantum entanglement checked: OK
    [ 0.004123] Quantum decoherence checked: OK
    [ 0.005541] Mounting VFS... done.
    [ 0.006262] Stacking bin... done.
    [ 0.007459] Lexical tokenizer... ready.
    ```
    
- **Easter Egg Commands:**
    
    - `sudo rm -rf /`: Triggers a screen shake effect and a "Permission Denied: You are not root" message.
    - `vim`: If they type `vim`, show a message: _"Nice try, but this is a readonly vfs."_
    - `cat`: If they type `cat` with a file name in argument, show a message: _"Trust me, you do not want to get overwhelmed."_
    - - `cat`: If they type `cat` without a file name in argument, show a message: _"meow"_ or _"dog"_ randomly. 

## 5. Integration Directives for Development

**To the Development Agent:**

1. **Initialize Context:** Create a `TerminalContext` in React to hold the filesystem state and command history array.
2. **Component Structure:**
* `<TerminalOverlay />`: The UI container.
* `<InputLine />`: Controlled input for capturing user keystrokes.
* `<OutputHistory />`: Renders previous commands and responses.



1. **Three.js Bridge:** Create a `useFrame` loop within the terminal logic (only when `htop` is active) to poll the `WebGLRenderer` stats without causing a re-render loop.
2. **Safety:** Sanitize all inputs to prevent actual XSS, even though this is a simulated environment.

---

**End of Specification.**
*Status: Ready for Implementation.*
*Priority: High (Core UX Feature).*

