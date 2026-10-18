/** Desktop and fine pointers should not jump the page when a field is focused. */
export function wantsFieldScroll(coarse) {
  return coarse === true;
}
