export function JsonLd({ data }: { data: unknown }) {
  // Escape <, >, & in JSON payload rendered inside a <script> — covers
  // </script> context break, HTML entity ambiguity, and forward-compat
  // CSP nonce validation. Matches OWASP JSON-in-HTML recommendation.
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
