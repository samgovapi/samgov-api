import { Actor, log } from 'apify';
import { getJson, errorText } from './common.js';
import { datasetParams, flatRow, exclusionCheckRows } from './rows.js';

const SITE = 'https://samgovapi.io';
const BASE = `${SITE}/api/v1`;
const UA = 'apify-actor/samgov-api';
const DATASETS = ['opportunities', 'entities', 'exclusions', 'awards'];
const LABEL = { opportunities: 'contract opportunities', entities: 'registered entities', exclusions: 'exclusion records', awards: 'contract awards' };

await Actor.init();
const input = (await Actor.getInput()) ?? {};
const { apiKey, dataset = 'opportunities', maxRequests = 100, maxItems = 500 } = input;
if (!DATASETS.includes(dataset)) await Actor.fail(`Unknown dataset "${dataset}". Use ${DATASETS.join(', ')}.`);
const params = datasetParams(dataset, input);
let pushed = 0;

// No key: up to 5 real rows per run from the keyless demo that samgovapi.io offers for evaluation, with the same filters.
if (!apiKey) {
    const p = new URLSearchParams({ ...params, limit: '5' });
    if (dataset === 'exclusions') {
        p.delete('active'); p.delete('classification');
        const q = params.q ?? params.uei ?? params.cage;
        p.delete('uei'); p.delete('cage');
        if (q) p.set('q', q);
    }
    const { ok, status: code, body } = await getJson(`${SITE}/api/demo/${dataset}?${p}`, {}, UA);
    if (!ok) await Actor.fail(errorText(body, code));
    const rows = (dataset === 'exclusions' && !Array.isArray(body?.data)
        ? exclusionCheckRows(body?.data, 'free_preview')
        : (Array.isArray(body?.data) ? body.data : []).map((r) => flatRow(r, dataset, 'free_preview'))
    ).slice(0, maxItems);
    if (rows.length) await Actor.pushData(rows);
    log.info(`Free preview: ${rows.length} real SAM.gov ${LABEL[dataset]} (the keyless demo returns up to 5 rows; source dated ${body?.meta?.as_of ?? 'recently'}).`);
    log.info(`For every row, paging and all filters, add a free API key from ${SITE}/sign-up (10,000 free credits a month, no card).`);
    await Actor.exit();
}

const auth = { authorization: `Bearer ${apiKey}`, 'x-user-request': `Apify Actor: SAM.gov ${dataset}`.trim() };
let requests = 0;
let cursor = null;
let asOf = null;
let credits = null;
for (;;) {
    if (requests >= maxRequests) { log.warning(`Stopped at the request limit (${maxRequests}). Raise "Max API requests" for more.`); break; }
    const p = new URLSearchParams({ ...params, limit: String(Math.min(100, Math.max(1, maxItems - pushed))) });
    if (cursor) p.set('cursor', cursor);
    requests++;
    const { ok, status: code, body } = await getJson(`${BASE}/${dataset}?${p}`, auth, UA);
    if (!ok) {
        if (pushed > 0) { log.warning(`Stopped after ${pushed} rows: ${errorText(body, code)}`); break; }
        await Actor.fail(errorText(body, code));
    }
    const data = Array.isArray(body?.data) ? body.data : [];
    const rows = data.slice(0, maxItems - pushed).map((r) => flatRow(r, dataset, 'live'));
    if (rows.length) await Actor.pushData(rows);
    pushed += rows.length;
    asOf = body?.meta?.as_of ?? asOf;
    credits = body?.meta?.remaining_credits ?? credits;
    cursor = body?.meta?.next_cursor ?? body?.next_cursor ?? null;
    if (!cursor || !data.length || pushed >= maxItems) break;
}
log.info(`Saved ${pushed} SAM.gov ${LABEL[dataset]} using ${requests} API requests${asOf ? ` (source dated ${asOf})` : ''}${credits != null ? `, ${credits} credits left` : ''}. Data: samgovapi.io, independent and not affiliated with GSA or SAM.gov.`);
await Actor.exit();
