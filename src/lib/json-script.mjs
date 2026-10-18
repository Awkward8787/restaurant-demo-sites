/** JSON for a <script> body. Escapes "<" so a data string cannot close the tag. */
export function jsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
