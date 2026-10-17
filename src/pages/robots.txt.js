export function GET() {
  const base = import.meta.env.BASE_URL || "/";
  return new Response(`User-agent: *\nAllow: ${base}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
