# Market Data Sources — All 30 SAparts Cities

## Data Points We Need Per City
For each city we need three monthly cost benchmarks:
1. **Hotel** — average 4-star hotel monthly equivalent (nightly rate × 30)
2. **Serviced Apartment** — average 1BR serviced apartment monthly rate (30+ night stay)
3. **Traditional Rental** — average 1BR unfurnished rental monthly rate

## Primary Scraping Sources (via Bright Data)

### Source A: Numbeo (numbeo.com)
- Coverage: All 30 cities ✓
- Data: Apartment rent (city centre 1BR, outside centre 1BR), cost of living index
- URL pattern: `https://www.numbeo.com/cost-of-living/in/{City}`
- Reliability: Crowdsourced but large sample, widely cited in academic papers

### Source B: Expatistan (expatistan.com)
- Coverage: All 30 cities ✓
- Data: Monthly rent 1BR city centre, 3BR city centre, cost of living comparison
- URL pattern: `https://www.expatistan.com/cost-of-living/{city}`
- Reliability: Crowdsourced, good for cross-city comparison

### Source C: Booking.com (via Bright Data residential proxy)
- Coverage: All 30 cities ✓
- Data: Average nightly hotel rate (4-star, 30-night stay) → multiply × 30 for monthly
- URL pattern: `https://www.booking.com/searchresults.html?ss={City}&stars=4&checkin=...&checkout=...`
- Reliability: Live market rates

### Source D: Government / Official Statistics (city-specific)
| City | Source | Data Available |
|---|---|---|
| London | ONS (ons.gov.uk) | Private rental index, median rent by borough |
| Edinburgh, Manchester, Cambridge, Liverpool, Jersey | ONS / Valuation Office Agency | Private rental statistics |
| Paris | INSEE (insee.fr) | Loyers de référence, rental indices |
| Berlin, Munich, Frankfurt | Mietspiegel (stadtentwicklung.berlin.de) | Official rent mirror |
| Amsterdam, The Hague | CBS Statistics Netherlands (cbs.nl) | Rental market statistics |
| Dublin | RTB (rtb.ie) | Residential Tenancies Board rent index |
| Copenhagen | Statistics Denmark (dst.dk) | Rental housing statistics |
| Zurich | Statistik Stadt Zürich | Rental price index |
| Lisbon | INE Portugal (ine.pt) | Rental market statistics |
| Madrid | Ministerio de Transportes (mitma.gob.es) | Rental price index |
| Munich | Mietspiegel München | Official rent mirror |
| Singapore | URA (ura.gov.sg) | Private residential rental index |
| Hong Kong | Rating and Valuation Dept (rvd.gov.hk) | Property market statistics |
| Sydney | NSW Fair Trading / Domain.com.au | Rental bond data |
| Tokyo | MLIT Japan (mlit.go.jp) | Land price and rental surveys |
| Dubai, Abu Dhabi | RERA / DLD (dubailand.gov.ae) | Real estate regulatory authority data |
| New York, SF, LA, Boston, Chicago | Zillow Research (zillow.com/research) | Rental market reports |
| Toronto | CMHC (cmhc-schl.gc.ca) | Rental market survey |
| Seoul | KB Kookmin Bank Real Estate (kbland.kr) | Rental price index |
| Shanghai, Mumbai | Local property portals (Anjuke, MagicBricks) | Rental listings |

## Scraping Strategy
1. **Phase 1 (Numbeo + Expatistan)** — scrape all 30 cities for rental benchmarks. Fast, consistent format.
2. **Phase 2 (Booking.com)** — scrape hotel rates for all 30 cities using Bright Data residential proxy.
3. **Phase 3 (Government portals)** — scrape official stats for the 10 highest-traffic cities (London, Paris, Dubai, Singapore, NYC, Sydney, Tokyo, Berlin, Amsterdam, Dublin).

## Output Schema (per city)
```
{
  city: string,
  country: string,
  hotel_monthly_usd: number,        // 4-star hotel × 30 nights
  serviced_apt_monthly_usd: number, // 1BR serviced apt, 30+ nights
  rental_1br_centre_usd: number,    // 1BR unfurnished, city centre
  rental_1br_outside_usd: number,   // 1BR unfurnished, outside centre
  rental_3br_centre_usd: number,    // 3BR unfurnished, city centre
  cost_of_living_index: number,     // Numbeo index (NYC = 100)
  source: string,                   // primary source name
  source_url: string,               // direct URL
  scraped_at: date
}
```
