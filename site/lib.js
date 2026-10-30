/** Financial arithmetic and provenance separation, independent of browser rendering. */
export function ratio(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
  return numerator / denominator;
}
export function cagr(first, last, years) {
  if (![first, last, years].every(Number.isFinite) || first <= 0 || last <= 0 || years <= 0) return null;
  return (last / first) ** (1 / years) - 1;
}
export function derived(row) {
  const operating = ratio(row.operating_profit, row.sales), net = ratio(row.net_profit, row.sales);
  return {...row, operating_margin: operating === null ? null : operating * 100,
    net_margin: net === null ? null : net * 100, calculated_pe: ratio(row.price, row.eps)};
}
export function sourceAudit(rows) {
  return rows.filter(row => row.kind === 'assignment_projection').map(row => {
    const result = derived(row);
    return {year: row.year, reported_opm: row.reported_opm, calculated_opm: result.operating_margin,
      reported_pe: row.reported_pe, calculated_pe: result.calculated_pe,
      inconsistent: Math.abs(row.reported_opm - result.operating_margin) > 0.05 || Math.abs(row.reported_pe - result.calculated_pe) > 0.05};
  });
}
export function scenario(baseEps, growth, multiple, years = 5, baseYear = 2020) {
  if (![baseEps, growth, multiple, years, baseYear].every(Number.isFinite) || baseEps <= 0 || baseEps > 1e6 || growth <= -1 || growth > 1 || multiple < 0 || multiple > 200 || !Number.isInteger(years) || years < 1 || years > 10) throw new Error('Use positive EPS, growth above -100% up to 100%, a 0–200 multiple, and 1–10 whole years.');
  return Array.from({length: years}, (_, index) => ({year: baseYear + index + 1, eps: baseEps * (1 + growth) ** (index + 1), hypothetical_price: baseEps * (1 + growth) ** (index + 1) * multiple}));
}
