## SAM.gov API: contract opportunities, entities, exclusions and awards

This Actor gives you U.S. federal contracting data as clean rows: open SAM.gov contract opportunities you can bid on, registered entities with UEI, CAGE, NAICS and registration expiry, exclusions (debarred, suspended and restricted parties), and contract awards from USAspending. It reads from [samgovapi.io](https://samgovapi.io), a SAM.gov API, so you get structured JSON with a source link on every record instead of scraping SAM.gov or living with its 10-requests-a-day limit.

**Try it with no key.** Leave the API key empty and run: you get up to 5 real rows of the dataset you pick, with your filters applied.

### What you get

| Dataset | What it returns |
|---|---|
| Contract opportunities | `title`, `type` (solicitation, sources sought, presolicitation, award notice), `department`, `office`, `posted_date`, `response_deadline`, `set_aside`, `naics`, `psc`, place of performance, `solicitation_number`, link to the notice. Open bids only, closing soonest or newest first. |
| Registered entities | `legal_name`, `dba_name`, `uei`, `cage`, `registration_status`, `expiration_date`, address, `primary_naics` and every listed NAICS and PSC, entity type, website. Find registrations expiring soon. |
| Exclusions | `name`, `classification`, `uei`, `cage`, `exclusion_type`, `exclusion_program`, `excluding_agency`, `active_date`, `termination_date`, address. Screen suppliers and teaming partners. |
| Contract awards | `recipient_name`, `recipient_uei`, `awarding_agency`, `piid`, `naics`, `psc`, `description`, `action_date`, `potential_end_date`, `obligated`, `potential_value`, `set_aside`. Find incumbents and likely recompetes. |

Filters: keyword or name, NAICS, PSC, set-aside, state, agency, notice type, posted and deadline dates, registration status, expiry window, fiscal year and minimum amount.

### Why an API instead of SAM.gov

SAM.gov's own API gives users without a role 10 requests a day and caps opportunity searches at one year per query, and scraping the site breaks often. This Actor reads samgovapi.io, which loads the public SAM.gov and USAspending extracts and serves them with paging and filters. Every row keeps a link to its SAM.gov or USAspending source.

The same data is a REST API ([docs](https://samgovapi.io/docs)) and a remote MCP server for Claude, ChatGPT and Cursor at `https://samgovapi.io/api/mcp`.

### How to use it

1. Run it with no key to see real rows.
2. Get a free API key at [samgovapi.io/sign-up](https://samgovapi.io/sign-up). The free plan includes 10,000 credits a month and needs no card.
3. Paste the key, pick a dataset, set your NAICS, set-aside or keyword and run. Schedule it daily for a bid digest and send the rows to a webhook, Google Sheets, Slack or your CRM through Apify integrations.

Each page of up to 100 rows is one request on your samgovapi.io plan. See [pricing](https://samgovapi.io/pricing).

### Example row (illustrative values)

```json
{
  "title": "IT Help Desk Support Services",
  "type": "Solicitation",
  "department": "VETERANS AFFAIRS, DEPARTMENT OF",
  "posted_date": "2026-11-17T04:21:09.000Z",
  "response_deadline": "2026-12-01T21:00:00.000Z",
  "set_aside": "Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside",
  "naics": "541512",
  "psc": "D399",
  "pop_state": "VA",
  "solicitation_number": "36C10B27Q0001"
}
```

### FAQ

**How fresh is the data?** Opportunities and awards refresh daily; entity registrations and exclusions follow the public SAM.gov extracts. Each run logs the source date.

**Can I check if a company is excluded?** Yes. Choose Exclusions and enter the exact name, UEI or CAGE code.

**Can I find recompetes?** Yes. Choose Contract awards, set your NAICS and "Expiring within" days to list contracts whose potential end date is near.

Independent data service operated by Stunning Couches LLC, not affiliated with or endorsed by GSA SAM.gov.
