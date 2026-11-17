/** Request parameters per dataset from the Actor input. Empty values are left out. */
export function datasetParams(dataset, input) {
    const {
        keyword, naics, psc, setAside, state, agency, agencyCode, noticeType, openOnly = true, postedFrom, postedTo,
        deadlineFrom, deadlineTo, sort, entityStatus, expiringWithinDays, uei, cage, classification, activeOnly = true,
        recipientUei, fiscalYear, minAmount, actionFrom, actionTo, vehicle,
    } = input;
    const p = {};
    const set = (k, v) => { if (v !== undefined && v !== null && String(v).trim() !== '' && v !== 'all' && v !== 'any') p[k] = String(v).trim(); };
    if (dataset === 'opportunities') {
        set('q', keyword); set('naics', naics); set('psc', psc); set('set_aside', setAside); set('state', state);
        set('agency', agency); set('agency_code', agencyCode); set('type', noticeType);
        set('posted_from', postedFrom); set('posted_to', postedTo); set('deadline_from', deadlineFrom); set('deadline_to', deadlineTo);
        set('sort', sort);
        if (openOnly) p.open = 'true';
    } else if (dataset === 'entities') {
        set('q', keyword); set('naics', naics); set('psc', psc); set('state', state); set('set_aside', setAside);
        set('status', entityStatus); set('expiring_within_days', expiringWithinDays);
    } else if (dataset === 'exclusions') {
        set('q', keyword); set('uei', uei); set('cage', cage); set('classification', classification);
        if (activeOnly) p.active = 'true';
    } else if (dataset === 'awards') {
        set('recipient', keyword); set('recipient_uei', recipientUei ?? uei); set('agency', agency); set('agency_code', agencyCode);
        set('naics', naics); set('psc', psc); set('vehicle', vehicle); set('fiscal_year', fiscalYear); set('min_amount', minAmount);
        set('action_from', actionFrom); set('action_to', actionTo); set('expiring_within_days', expiringWithinDays);
    }
    return p;
}

const SAM_OPP = 'https://sam.gov/opp/';

/** Flatten nested objects one level (address.city to address_city) and keep arrays as they are. */
export function flatRow(row, dataset, mode) {
    const out = {};
    for (const [k, v] of Object.entries(row ?? {})) {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            for (const [k2, v2] of Object.entries(v)) out[`${k}_${k2}`] = v2;
        } else out[k] = v;
    }
    if (dataset === 'opportunities' && !out.url && out.notice_id) out.url = `${SAM_OPP}${out.notice_id}/view`;
    out.dataset = dataset;
    out.data_mode = mode;
    return out;
}

/** The keyless exclusions demo answers a name, UEI or CAGE check; turn it into rows. */
export function exclusionCheckRows(data, mode) {
    const matches = Array.isArray(data?.matches) ? data.matches : [];
    if (matches.length) return matches.map((m) => ({ ...flatRow(m, 'exclusions', mode), checked: data.query ?? null, excluded: true }));
    return [{ dataset: 'exclusions', checked: data?.query ?? null, excluded: Boolean(data?.excluded), answer: data?.answer ?? null, data_mode: mode }];
}
