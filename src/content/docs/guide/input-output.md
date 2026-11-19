---
title: Input and output
description: readLine, inputReady, clock, readFile and writeFile.
sidebar:
  order: 3
---

```um
while (true) {
  const line = readLine();          // string | null
  if (line == null) { break; }      // end of input
  print("got " + line);
}
```

| Function | Behaviour |
| --- | --- |
| `readLine(): string \| null` | Reads one line from standard input. The trailing newline (and one `\r` before it) is not included. Returns `null` at the end of input. There is no limit on line length. Flushes standard output before waiting. |
| `inputReady(): bool` | `true` if `readLine()` would return without waiting (a whole line up to the newline has arrived, or input has ended; `false` if only part of a line has arrived). Also flushes standard output. It is cheap, so it can be called many times during a search. |
| `clock(): f64` | Seconds since the program started. Never goes backwards. |
| `stringFromBytes(bytes: u8[]): string` | Makes a new string copying the bytes (does not check that they are UTF-8). |
| `readFile(path: string): u8[] \| null` | Reads a whole file as bytes. `null` if it cannot be read. |
| `writeFile(path: string, bytes: u8[]): bool` | Creates the file (replacing its contents if it exists) and writes it. `true` if everything was written. |

- **Arguments are only borrowed, and results are new values.** Put a `string | null` or `u8[] | null` in a `const` and check it with `if (x != null)` before use.
- **If the program defines a function with the same name, the program's function takes precedence.** These functions cannot be used inside kernels.
- **`print` output is written out in batches.** When talking to another program through a pipe, the output reaches it when `readLine()` or `inputReady()` is called (and at exit).
- **Files whose names contain a 0 byte cannot be read or written** (`null` / `false`).
- **Even if standard input is non-blocking (O_NONBLOCK), `readLine()` waits until a line arrives** (a line that has not arrived yet is not treated as the end of input).
- **Files and lines of 2 GiB or more can be read and written** (requests to the OS are split into 1 GiB pieces).
- **On wasm32, I/O goes only through the hooks the loader provides,** passed as `instantiate(bytes, { readLine, inputReady, readFile, writeFile })`. If they are not provided, `readLine()` returns `null`, `inputReady()` returns `true` (input has ended), `readFile()` returns `null` and `writeFile()` returns `false`. File names are passed to the hooks as UTF-8 strings, so names that cannot be read as UTF-8 fail on wasm32 (`null` / `false`). `runtime/run-node.mjs` connects standard input and files directly (Node has no way to check whether input can be read without waiting, so `inputReady()` answers only from what has already been read). **wasm32 I/O has only been checked as far as producing an object file (running it has not been checked).**

Examples: [examples/input_lines.um](/examples/input-lines/), [examples/bytes_and_files.um](/examples/bytes-and-files/).
