import { log } from 'apify';

export const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const round = (v, dp = 2) => (v === null ? null : Math.round(v * 10 ** dp) / 10 ** dp);

/** GET JSON with retries on 429 and 5xx. Never throws on HTTP errors; returns { ok, status, body }. */
export async function getJson(url, headers = {}, ua = 'apify-actor') {
    for (let attempt = 1; ; attempt++) {
        let res;
        try { res = await fetch(url, { headers: { 'user-agent': ua, accept: 'application/json', ...headers } }); }
        catch (e) { if (attempt < 3) { await sleep(2000 * attempt); continue; } return { ok: false, status: 0, body: { error: { message: String(e?.message ?? e) } } }; }
        const body = await res.json().catch(() => null);
        if (res.status === 429 && attempt < 4) {
            const wait = Math.min(60, Number(res.headers.get('retry-after')) || 5 * attempt);
            log.warning(`Rate limited, waiting ${wait}s`);
            await sleep(wait * 1000);
            continue;
        }
        if (res.status >= 500 && attempt < 3) { await sleep(2000 * attempt); continue; }
        return { ok: res.ok, status: res.status, body };
    }
}

export const errorText = (body, status) => {
    const e = body?.error;
    const message = (typeof e === 'string' ? e : e?.message) ?? body?.message ?? `HTTP ${status}`;
    const upgrade = e?.upgrade_url ? ` Upgrade: ${e.upgrade_url}` : '';
    return `${message}${upgrade}`;
};
