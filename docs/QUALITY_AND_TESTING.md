# Example Authoring and Validation Guide

ByteCraft CS is a collection of computer-science learning examples, notes, and experiments. Examples may use different languages and runtimes; do not assume a single repository-wide build command covers every folder.

## Adding an example

For each example, document:
- The concept and intended learning outcome
- Language and runtime version
- Required dependencies
- Exact run command from the repository root or example directory
- Expected output or observable behavior
- Important limitations and links to related concepts

Clearly label pseudocode and conceptual snippets that cannot be executed directly.

## Validation

Before submitting an example:
1. Follow the documented setup from a clean checkout.
2. Run the exact command shown in the documentation.
3. Check normal input, empty/malformed input, and boundary values where relevant.
4. Verify that expected output matches actual output.
5. Keep generated binaries, caches, credentials, and local environment files out of commits.

For runnable examples, add a small test or CI smoke check when the runtime and dependencies are available. Use isolated temporary data for file/database examples.

## Documentation quality

Use consistent filenames and headings. Explain non-obvious algorithm choices and complexity where relevant. Avoid claiming that an example is optimized, secure, or production-ready unless that property has been measured or reviewed.

## Pull-request checklist

- [ ] Include purpose, prerequisites, run command, and expected output.
- [ ] Execute the example and report the result.
- [ ] Add tests for the changed behavior where practical.
- [ ] Distinguish executable code from pseudocode.
- [ ] Avoid unrelated examples or generated files in the same PR.
