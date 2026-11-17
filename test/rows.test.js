import { test } from 'node:test';
import assert from 'node:assert/strict';
import { datasetParams, flatRow, exclusionCheckRows } from '../src/rows.js';

test('opportunity parameters', () => {
    const p = datasetParams('opportunities', { keyword: 'cyber', naics: '5415', noticeType: 'all', sort: 'deadline', openOnly: true, state: '' });
    assert.deepEqual(p, { q: 'cyber', naics: '5415', sort: 'deadline', open: 'true' });
});

test('entity, exclusion and award parameters', () => {
    assert.deepEqual(datasetParams('entities', { keyword: 'acme', entityStatus: 'any', expiringWithinDays: 30 }), { q: 'acme', expiring_within_days: '30' });
    assert.deepEqual(datasetParams('exclusions', { uei: 'ABC', classification: 'Firm', activeOnly: false }), { uei: 'ABC', classification: 'Firm' });
    assert.deepEqual(datasetParams('awards', { keyword: 'acme', fiscalYear: 2026, minAmount: 0 }), { recipient: 'acme', fiscal_year: '2026', min_amount: '0' });
});

test('rows flatten one level and keep arrays', () => {
    const r = flatRow({ name: 'X', address: { city: 'C', country: 'USA' }, naics: ['1', '2'] }, 'exclusions', 'live');
    assert.deepEqual([r.address_city, r.address_country, r.naics.length, r.dataset], ['C', 'USA', 2, 'exclusions']);
    assert.equal(flatRow({ notice_id: 'n1' }, 'opportunities', 'live').url, 'https://sam.gov/opp/n1/view');
});

test('exclusion check turns into rows', () => {
    assert.equal(exclusionCheckRows({ query: 'q', excluded: false, matches: [], answer: 'No' }, 'free_preview')[0].answer, 'No');
    const rows = exclusionCheckRows({ query: 'h', excluded: true, matches: [{ name: 'A', address: { city: 'B' } }] }, 'free_preview');
    assert.deepEqual([rows[0].name, rows[0].address_city, rows[0].excluded], ['A', 'B', true]);
});
