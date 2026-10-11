/**
 * A log-scale bar chart, as numbers. The component draws it; this decides
 * where everything goes, so the geometry is tested without a browser.
 *
 * Log scale because the values it exists for span three orders of
 * magnitude: on a linear axis AlphaSettler's 68 ns and catan-rl's 88 ns are
 * both a sliver next to Catanatron's 20,691.
 */

const NUMBER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const GROUPS = ['', 'k', 'M'];

const isPowerOfTen = x => Number.isFinite(x) && x > 0 && 10 ** Math.round(Math.log10(x)) === x;
const hasText = v => typeof v === 'string' && v.trim().length > 0;

/** 10 → "10", 1000 → "1k", 100000 → "100k". Domains start at 1 or more. */
export function tickLabel(value) {
  const exp = Math.round(Math.log10(value));
  const group = Math.min(Math.floor(exp / 3), GROUPS.length - 1);
  return `${10 ** (exp - 3 * group)}${GROUPS[group]}`;
}

export function validateLogBars(chart) {
  if (chart?.kind !== 'log-bars') return [`unknown kind "${chart?.kind}"`];
  const errors = [];
  if (!hasText(chart.unit)) errors.push('needs a unit');
  const [lo, hi] = Array.isArray(chart.domain) ? chart.domain : [];
  const domainOk = isPowerOfTen(lo) && isPowerOfTen(hi) && lo >= 1 && lo < hi;
  if (!domainOk) errors.push('domain must be two powers of ten, at least 1, low to high');
  const bars = Array.isArray(chart.bars) ? chart.bars : [];
  if (bars.length < 2 || bars.length > 6) errors.push(`needs 2 to 6 bars, found ${bars.length}`);
  bars.forEach((bar, i) => {
    if (!hasText(bar?.label)) errors.push(`bars[${i}]: needs a label`);
    if (!(Number.isFinite(bar?.value) && bar.value > 0)) errors.push(`bars[${i}]: value must be a positive number`);
    else if (domainOk && (bar.value < lo || bar.value > hi)) errors.push(`bars[${i}]: ${bar.value} is outside the domain`);
  });
  return errors;
}

export function logBarLayout(chart) {
  const [lo, hi] = chart.domain;
  const span = Math.log10(hi) - Math.log10(lo);
  const percent = v => ((Math.log10(v) - Math.log10(lo)) / span) * 100;
  const ticks = [];
  for (let v = lo; v <= hi; v *= 10) ticks.push({ value: v, label: tickLabel(v), percent: percent(v) });
  return {
    ticks,
    bars: chart.bars.map(bar => ({
      label: bar.label,
      value: bar.value,
      display: NUMBER.format(bar.value),
      percent: percent(bar.value),
      highlight: Boolean(bar.highlight),
    })),
  };
}
