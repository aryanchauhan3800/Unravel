import { expect, test } from "bun:test";

import { extractUnravelTargets, handleUnravelUri } from "../src/chat/unravelUri";

test("extractUnravelTargets parses procedure and address links from markdown", () => {
  const text = `
### EVIDENCE
- [validate_license](unravel://procedure/validate_license) at [0x100003f20](unravel://address/0x100003f20)
- [verify_token](unravel://function/verify_token)
- Non-unravel link: [Docs](https://example.com)
  `;
  expect(extractUnravelTargets(text)).toEqual(["validate_license", "0x100003f20", "verify_token"]);
});

test("handleUnravelUri opens procedures and addresses", () => {
  const opened: string[] = [];
  const onOpen = (target: string): void => {
    opened.push(target);
  };

  expect(handleUnravelUri("unravel://procedure/my_func", onOpen)).toBe(true);
  expect(opened).toEqual(["my_func"]);

  expect(handleUnravelUri("unravel://address/0x100003f20", onOpen)).toBe(true);
  expect(opened).toEqual(["my_func", "0x100003f20"]);

  expect(handleUnravelUri("https://google.com", onOpen)).toBe(false);
});

