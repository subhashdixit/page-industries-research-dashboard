import {lineChart, metric, number, table, downloadCsv} from './charts.js';
import {cagr, derived, scenario, sourceAudit} from './lib.js';
const get = id => document.getElementById(id);
let data, visible = [];
const headers = ['Year / type', 'Sales', 'Expenses', 'Operating profit', 'Net profit', 'EPS', 'Price', 'Calculated OPM %', 'Calculated P/E'];
function tableRows(rows) { return rows.map(row => [row.year + (row.kind === 'assignment_projection' ? ' · assignment projection' : ' · historical reported'), row.sales, row.expenses, row.operating_profit, row.net_profit, row.eps, row.price, number(row.operating_margin, 2), number(row.calculated_pe, 2)]); }
function render() {
  const historical = data.rows.filter(row => row.kind === 'historical_reported').map(derived);
  const first = historical[0], last = historical.at(-1);
  get('metrics').replaceChildren(metric('Last reported year', String(last.year)), metric('Reported EPS', number(last.eps, 4), 'Source per-share units'), metric('Recomputed operating margin', number(last.operating_margin, 2) + '%'), metric('Historical sales CAGR', number(cagr(first.sales, last.sales, last.year - first.year) * 100, 2) + '%', `${first.year}–${last.year}; not a forecast`));
  lineChart(get('eps'), historical.map(row => ({label: String(row.year), value: row.eps})), 'Reported historical EPS');
  lineChart(get('margin'), historical.map(row => ({label: String(row.year), value: row.operating_margin})), 'Recomputed historical operating margin');
  visible = data.rows.filter(row => get('projections').checked || row.kind === 'historical_reported').map(derived);
  table(get('financial-table'), headers, tableRows(visible));
  table(get('audit-table'), ['Projection year', 'Source OPM %', 'Recomputed OPM %', 'Source P/E', 'Recomputed P/E', 'Check'], sourceAudit(data.rows).map(row => [row.year, row.reported_opm, number(row.calculated_opm, 2), row.reported_pe, number(row.calculated_pe, 2), row.inconsistent ? 'Does not reconcile' : 'Within rounding tolerance']));
}
function calculate() {
  try {
    if (['growth','multiple','years'].some(id => get(id).value.trim() === '')) throw new Error('Fill all scenario assumptions explicitly.');
    const base = data.rows.find(row => row.year === 2020);
    const result = scenario(base.eps, Number(get('growth').value) / 100, Number(get('multiple').value), Number(get('years').value));
    lineChart(get('scenario-chart'), result.map(row => ({label: String(row.year) + ' scenario', value: row.hypothetical_price})), 'Hypothetical arithmetic scenario', '#996538');
    table(get('scenario-table'), ['Hypothetical year', 'Scenario EPS', 'Hypothetical price at assumed multiple'], result.map(row => [row.year + ' · scenario', number(row.eps, 4), number(row.hypothetical_price, 2)]));
    get('scenario-error').hidden = true;
  } catch (error) { get('scenario-error').textContent = error.message; get('scenario-error').hidden = false; }
}
async function start() {
  try {
    const response = await fetch('./data.json'); if (!response.ok) throw new Error('Cannot load the source transcription.');
    data = await response.json();
    get('projections').addEventListener('change', render);
    get('calculate').addEventListener('click', calculate);
    get('download').addEventListener('click', () => downloadCsv('page-industries-report-transcription.csv', headers, tableRows(visible)));
    get('source-hash').textContent = `Original report SHA-256: ${data.source.sha256}`;
    get('status').textContent = 'Historical transcription loaded. Original projections remain explicitly separated.';
    render(); calculate();
  } catch (error) { get('error').textContent = error.message; get('error').hidden = false; get('status').textContent = 'Source could not be loaded.'; }
}
start();
