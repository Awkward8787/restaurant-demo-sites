/** Language of the span. A missing translation stays English, so it is not read with Spanish or Portuguese rules. */
export function spokenLang(code, source) {
  if (code === "en") return undefined;
  if (source && typeof source[code] === "string" && source[code] !== "") return code;
  return "en";
}
