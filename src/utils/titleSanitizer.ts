/**
 * Sanitize paper titles containing MathML, HTML, or LaTeX markup.
 *
 * APS titles often include MathML like:
 *   BaMnBi <mml:math ...><mml:msub><mml:mi/><mml:mn>2</mml:mn></mml:msub></mml:math>
 * Wiley/ACS titles may include HTML:
 *   Sp<sup>2</sup>-Carbon ... H<sub>2</sub>O<sub>2</sub>
 * Some titles include LaTeX:
 *   $$\textrm{Ba}_{2}\textrm{La}_{2}\textrm{CoTe}_{2}\textrm{O}_{12}$$
 *
 * Returns an HTML string safe for dangerouslySetInnerHTML.
 */
export function sanitizeTitle(raw: string): string {
  // ── LaTeX → HTML (lightweight, no KaTeX) ────────────────────
  if (raw.includes('$')) {
    const s = raw.replace(/\$\$([\s\S]*?)\$\$|\$([^$]+)\$/g, (_match, display?: string, inline?: string) => {
      return texToHtml((display ?? inline ?? '').trim());
    });
    return s;
  }

  // ── MathML / HTML sanitization ──────────────────────────────
  if (!raw.includes('<')) return raw;

  let s = raw;

  // Strip <mml:math ...> wrapper
  s = s.replace(/<mml:math[^>]*>/gi, '');
  s = s.replace(/<\/mml:math>/gi, '');

  // Strip <mml:mrow> grouping (keep content)
  s = s.replace(/<\/?mml:mrow>/gi, '');

  // <mml:msub><mml:mi/><mml:mn>N</mml:mn></mml:msub> → <sub>N</sub>
  s = s.replace(
    /<mml:msub>\s*<mml:mi\s*\/>\s*<mml:mn>([^<]*)<\/mml:mn>\s*<\/mml:msub>/gi,
    '<sub>$1</sub>',
  );
  // <mml:msub><mml:mi>X</mml:mi><mml:mn>N</mml:mn></mml:msub> → X<sub>N</sub>
  s = s.replace(
    /<mml:msub>\s*<mml:mi>([^<]*)<\/mml:mi>\s*<mml:mn>([^<]*)<\/mml:mn>\s*<\/mml:msub>/gi,
    '$1<sub>$2</sub>',
  );

  // <mml:msup><mml:mi/><mml:mn>N</mml:mn></mml:msup> → <sup>N</sup>
  s = s.replace(
    /<mml:msup>\s*<mml:mi\s*\/>\s*<mml:mn>([^<]*)<\/mml:mn>\s*<\/mml:msup>/gi,
    '<sup>$1</sup>',
  );
  // <mml:msup><mml:mi>X</mml:mi><mml:mn>N</mml:mn></mml:msup> → X<sup>N</sup>
  s = s.replace(
    /<mml:msup>\s*<mml:mi>([^<]*)<\/mml:mi>\s*<mml:mn>([^<]*)<\/mml:mn>\s*<\/mml:msup>/gi,
    '$1<sup>$2</sup>',
  );

  // Strip remaining MathML tags (keep text content)
  s = s.replace(/<\/?mml:\w+[^>]*>/gi, '');

  // Strip all HTML except exact <sub>, </sub>, <sup>, </sup>
  s = s.replace(/<(?!\/?(?:sub|sup)>)[^>]+>/gi, '');

  // Clean up whitespace
  s = s.replace(/\s{2,}/g, ' ').trim();

  return s;
}

/**
 * Convert simple LaTeX to HTML.
 * Handles: \textrm{}, \text{}, \mathrm{}, _{}, ^{}, \alpha etc.
 */
function texToHtml(tex: string): string {
  let s = tex;

  // \textrm{X}, \text{X}, \mathrm{X}, \mathbf{X} → X
  s = s.replace(/\\(?:textrm|text|mathrm|textit|mathit|mathbf|textbf|rm)\{([^}]*)\}/g, '$1');

  // \, \; \! \quad \qquad → space
  s = s.replace(/\\[,;!]|\\q?quad/g, ' ');

  // _{...} → <sub>...</sub> (process inner content recursively)
  s = s.replace(/\\_/g, '\x00SUB\x00'); // escape literal \_
  s = s.replace(/_\{([^}]*)\}/g, '<sub>$1</sub>');
  s = s.replace(/_([A-Za-z0-9])/g, '<sub>$1</sub>');
  s = s.replace(/\x00SUB\x00/g, '_');

  // ^{...} → <sup>...</sup>
  s = s.replace(/\\\^/g, '\x00SUP\x00'); // escape literal \^
  s = s.replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>');
  s = s.replace(/\^([A-Za-z0-9])/g, '<sup>$1</sup>');
  s = s.replace(/\x00SUP\x00/g, '^');

  // Greek letters
  s = s.replace(/\\alpha/g, '\u03B1');
  s = s.replace(/\\beta/g, '\u03B2');
  s = s.replace(/\\gamma/g, '\u03B3');
  s = s.replace(/\\delta/g, '\u03B4');
  s = s.replace(/\\epsilon/g, '\u03B5');
  s = s.replace(/\\zeta/g, '\u03B6');
  s = s.replace(/\\eta/g, '\u03B7');
  s = s.replace(/\\theta/g, '\u03B8');
  s = s.replace(/\\kappa/g, '\u03BA');
  s = s.replace(/\\lambda/g, '\u03BB');
  s = s.replace(/\\mu/g, '\u03BC');
  s = s.replace(/\\nu/g, '\u03BD');
  s = s.replace(/\\xi/g, '\u03BE');
  s = s.replace(/\\pi/g, '\u03C0');
  s = s.replace(/\\rho/g, '\u03C1');
  s = s.replace(/\\sigma/g, '\u03C3');
  s = s.replace(/\\tau/g, '\u03C4');
  s = s.replace(/\\phi/g, '\u03C6');
  s = s.replace(/\\chi/g, '\u03C7');
  s = s.replace(/\\psi/g, '\u03C8');
  s = s.replace(/\\omega/g, '\u03C9');
  s = s.replace(/\\Gamma/g, '\u0393');
  s = s.replace(/\\Delta/g, '\u0394');
  s = s.replace(/\\Sigma/g, '\u03A3');
  s = s.replace(/\\Omega/g, '\u03A9');

  // Common math symbols
  s = s.replace(/\\times/g, '\u00D7');
  s = s.replace(/\\cdot/g, '\u00B7');
  s = s.replace(/\\pm/g, '\u00B1');
  s = s.replace(/\\mp/g, '\u2213');
  s = s.replace(/\\approx/g, '\u2248');
  s = s.replace(/\\sim/g, '\u223C');
  s = s.replace(/\\leq/g, '\u2264');
  s = s.replace(/\\geq/g, '\u2265');
  s = s.replace(/\\rightarrow/g, '\u2192');
  s = s.replace(/\\leftarrow/g, '\u2190');
  s = s.replace(/\\infty/g, '\u221E');
  s = s.replace(/\\ell/g, '\u2113');
  s = s.replace(/\\hbar/g, '\u0127');

  // Strip remaining backslash commands
  s = s.replace(/\\[a-zA-Z]+/g, '');

  // Strip remaining braces
  s = s.replace(/[{}]/g, '');

  // Clean up whitespace
  s = s.replace(/\s{2,}/g, ' ').trim();

  return s;
}
