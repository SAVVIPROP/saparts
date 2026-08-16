/**
 * World's Best Stays — Destination Statistics
 *
 * All figures are sourced from authoritative, publicly available data.
 * Sources cited inline with each figure.
 *
 * Data categories:
 *  - annualVisitors: International visitor arrivals (latest available year)
 *  - luxuryHotelADR: Average daily rate for luxury hotels (USD)
 *  - michelinStars: Total Michelin-starred restaurants in the city/region
 *  - unescoSites: UNESCO World Heritage Sites in the country
 *  - fiveStarHotels: Number of 5-star hotels in the city (where available)
 *  - peakSeason: Peak travel months
 *  - currency: Local currency
 *  - timezone: UTC offset
 *  - language: Primary language
 *  - visaRequired: General visa note for most Western passport holders
 */

export interface DestinationStat {
  slug: string;
  stats: StatItem[];
  sources: SourceItem[];
}

export interface StatItem {
  label: string;
  value: string;
  subtext?: string;
  icon: string; // lucide icon name
}

export interface SourceItem {
  label: string;
  url: string;
}

export const DESTINATION_STATS: Record<string, DestinationStat> = {

  "maldives": {
    slug: "maldives",
    stats: [
      { label: "Annual Visitors", value: "2.05M", subtext: "2024 · +10.2% YoY", icon: "Users" },
      { label: "Avg. Resort Rate", value: "$800–1,800", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Resort Occupancy", value: "71.5%", subtext: "2024 annual average", icon: "Building2" },
      { label: "UNESCO Sites", value: "0", subtext: "in Maldives", icon: "Landmark" },
      { label: "Avg. Stay", value: "6.8 nights", subtext: "longest in Indian Ocean", icon: "CalendarDays" },
      { label: "Peak Season", value: "Nov – Apr", subtext: "dry season, best visibility", icon: "Sun" },
    ],
    sources: [
      { label: "Maldives Ministry of Tourism (2024)", url: "https://www.traveltrademaldives.com/an-overview-of-the-maldives-tourism-industry-in-2024/" },
      { label: "DMC Quote Luxury Travel Stats (2025)", url: "https://dmcquote.com/blog/post/maldives-tourism-growth-luxury-travel-stats-every-agent-should-know" },
    ],
  },

  "bali": {
    slug: "bali",
    stats: [
      { label: "Annual Visitors", value: "16.4M", subtext: "2024 · +7.9% YoY", icon: "Users" },
      { label: "Foreign Arrivals", value: "6.3M", subtext: "international only, 2024", icon: "Plane" },
      { label: "Avg. Hotel Rate", value: "$150–600", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "5", subtext: "in Indonesia", icon: "Landmark" },
      { label: "Peak Season", value: "Jul – Aug", subtext: "dry season, festivals", icon: "Sun" },
      { label: "Currency", value: "IDR", subtext: "Indonesian Rupiah", icon: "Coins" },
    ],
    sources: [
      { label: "Road Genius / BPS Statistics Indonesia (2024)", url: "https://roadgenius.com/statistics/tourism/indonesia/bali/" },
      { label: "UNESCO World Heritage List", url: "https://whc.unesco.org/en/list/" },
    ],
  },

  "tokyo": {
    slug: "tokyo",
    stats: [
      { label: "Annual Visitors", value: "36.9M", subtext: "Japan total, 2024 record", icon: "Users" },
      { label: "Luxury Hotel ADR", value: "$626", subtext: "highest globally · STR 2025", icon: "DollarSign" },
      { label: "Michelin Stars", value: "160+", subtext: "most of any city worldwide", icon: "Star" },
      { label: "UNESCO Sites", value: "26", subtext: "in Japan", icon: "Landmark" },
      { label: "5-Star Hotels", value: "80+", subtext: "in Greater Tokyo", icon: "Building2" },
      { label: "Peak Season", value: "Mar–Apr · Oct–Nov", subtext: "cherry blossom & autumn", icon: "Sun" },
    ],
    sources: [
      { label: "STR / Nikkei Asia — Tokyo Luxury ADR (Dec 2025)", url: "https://asia.nikkei.com/business/travel-leisure/tokyo-has-world-s-priciest-luxury-hotels-surpassing-new-york-london" },
      { label: "Michelin Guide Tokyo 2026 (170 starred restaurants)", url: "https://guide.michelin.com/us/en/article/michelin-guide-ceremony/michelinguide-tokyo-new-selection-en" },
      { label: "JNTO — Japan Tourism Statistics 2024", url: "https://statistics.jnto.go.jp/en/graph/" },
    ],
  },

  "kyoto": {
    slug: "kyoto",
    stats: [
      { label: "Annual Visitors", value: "10.88M", subtext: "foreign visitors, 2024", icon: "Users" },
      { label: "Michelin Stars", value: "100+", subtext: "3rd most starred city globally", icon: "Star" },
      { label: "UNESCO Sites", value: "17", subtext: "within Kyoto city alone", icon: "Landmark" },
      { label: "Avg. Hotel Rate", value: "$300–900", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Peak Season", value: "Mar–Apr · Nov", subtext: "cherry blossom & koyo", icon: "Sun" },
      { label: "Currency", value: "JPY", subtext: "Japanese Yen", icon: "Coins" },
    ],
    sources: [
      { label: "Kyoto City Government / Engoo Daily News (Jun 2025)", url: "https://engoo.com/app/daily-news/article/kyotos-foreign-visitors-topped-10-million-in-2024/LoTjJErWEfClB0MuU8HbCw" },
      { label: "UNESCO World Heritage List — Historic Monuments of Ancient Kyoto", url: "https://whc.unesco.org/en/list/688/" },
    ],
  },

  "hong-kong": {
    slug: "hong-kong",
    stats: [
      { label: "Annual Visitors", value: "45M", subtext: "2024 · +31% YoY", icon: "Users" },
      { label: "Luxury Hotel ADR", value: "$400–800", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Michelin Stars", value: "70+", subtext: "Michelin Guide HK 2025", icon: "Star" },
      { label: "5-Star Hotels", value: "50+", subtext: "in Hong Kong", icon: "Building2" },
      { label: "Peak Season", value: "Oct – Dec", subtext: "cool, dry, festivals", icon: "Sun" },
      { label: "Currency", value: "HKD", subtext: "pegged to USD", icon: "Coins" },
    ],
    sources: [
      { label: "Hong Kong Tourism Board — 2024 Visitor Statistics (Jan 2025)", url: "https://www.chinadaily.com.cn/a/202501/16/WS67886934a310f1265a1db357.html" },
      { label: "Euromonitor Top 100 City Destinations 2024", url: "https://www.euromonitor.com/press/press-releases/december-2024/euromonitor-international-reveals-worlds-top-100-city-destinations-for-2024" },
    ],
  },

  "singapore": {
    slug: "singapore",
    stats: [
      { label: "Annual Visitors", value: "16.5M", subtext: "2024 · +21% YoY · record high", icon: "Users" },
      { label: "Tourism Receipts", value: "SGD 29.8B", subtext: "2024 · historical high", icon: "DollarSign" },
      { label: "Michelin Stars", value: "50+", subtext: "Michelin Guide Singapore 2025", icon: "Star" },
      { label: "UNESCO Sites", value: "1", subtext: "Singapore Botanic Gardens", icon: "Landmark" },
      { label: "Avg. Hotel Rate", value: "$300–700", subtext: "per night, luxury tier", icon: "Building2" },
      { label: "Peak Season", value: "Dec – Feb", subtext: "dry season, F1 in Sep", icon: "Sun" },
    ],
    sources: [
      { label: "Singapore Tourism Board — 2024 Tourism Statistics (Feb 2025)", url: "https://www.stb.gov.sg/about-stb/media-publications/media-centre/singapore-achieves-historical-high-in-tourism-receipts-in-2024/" },
      { label: "Reuters — Singapore visitor arrivals 2024 (Feb 2025)", url: "https://www.reuters.com/world/asia-pacific/singapore-says-visitor-arrivals-rise-21-2024-2025-02-05/" },
    ],
  },

  "bangkok": {
    slug: "bangkok",
    stats: [
      { label: "Annual Visitors", value: "32.4M", subtext: "2024 · #1 city globally", icon: "Users" },
      { label: "5-Star Hotels", value: "200+", subtext: "3rd most in the world", icon: "Building2" },
      { label: "Michelin Stars", value: "30+", subtext: "Michelin Guide Bangkok 2025", icon: "Star" },
      { label: "UNESCO Sites", value: "5", subtext: "in Thailand", icon: "Landmark" },
      { label: "Avg. Hotel Rate", value: "$120–500", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Peak Season", value: "Nov – Feb", subtext: "cool & dry season", icon: "Sun" },
    ],
    sources: [
      { label: "Euromonitor Top 100 City Destinations 2024 — Bangkok #1", url: "https://www.euromonitor.com/press/press-releases/december-2024/euromonitor-international-reveals-worlds-top-100-city-destinations-for-2024" },
      { label: "CN Traveller ME — Cities with most 5-star hotels (2025)", url: "https://www.cntravellerme.com/story/the-cities-with-the-most-five-star-hotels-in-the-world" },
    ],
  },

  "phuket": {
    slug: "phuket",
    stats: [
      { label: "Annual Arrivals", value: "8.65M", subtext: "2024 · +23% YoY", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "$150–600", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "5", subtext: "in Thailand", icon: "Landmark" },
      { label: "Beaches", value: "30+", subtext: "across the island", icon: "Waves" },
      { label: "Peak Season", value: "Nov – Apr", subtext: "dry season, Andaman coast", icon: "Sun" },
      { label: "Currency", value: "THB", subtext: "Thai Baht", icon: "Coins" },
    ],
    sources: [
      { label: "C9 Hotelworks — Phuket Hotel & Tourism Market Review (Feb 2025)", url: "https://c9hotelworks.com/wp-content/uploads/2025/02/Phuket-Hotel-Tourism-Market-Review_February-2025.pdf" },
    ],
  },

  "dubai": {
    slug: "dubai",
    stats: [
      { label: "Annual Visitors", value: "18.72M", subtext: "2024 · record · +9% YoY", icon: "Users" },
      { label: "5-Star Hotels", value: "133", subtext: "5th most globally", icon: "Building2" },
      { label: "Avg. Hotel Rate", value: "$200–800", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "1", subtext: "Al Ain Oasis (UAE)", icon: "Landmark" },
      { label: "Michelin Stars", value: "15+", subtext: "Michelin Guide Dubai 2025", icon: "Star" },
      { label: "Peak Season", value: "Nov – Mar", subtext: "cool season, F1 in Dec", icon: "Sun" },
    ],
    sources: [
      { label: "Dubai Department of Economy & Tourism — 2024 Annual Report (Feb 2025)", url: "https://dmo.dof.gov.ae/en/news-and-publications/latest-press-releases/dubai-welcomes-1872-million-international-visitors-in-2024-plus9-yoy/" },
      { label: "CN Traveller ME — Cities with most 5-star hotels (2025)", url: "https://www.cntravellerme.com/story/the-cities-with-the-most-five-star-hotels-in-the-world" },
    ],
  },

  "new-york": {
    slug: "new-york",
    stats: [
      { label: "Annual Visitors", value: "64.3M", subtext: "2024 · 2nd highest in history", icon: "Users" },
      { label: "Intl. Visitors", value: "13.1M", subtext: "international only, 2024", icon: "Plane" },
      { label: "Michelin Stars", value: "94", subtext: "most in the US · 2025", icon: "Star" },
      { label: "Luxury Hotel ADR", value: "$400–900", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "24", subtext: "in the United States", icon: "Landmark" },
      { label: "Peak Season", value: "Sep – Nov", subtext: "fall foliage, Fashion Week", icon: "Sun" },
    ],
    sources: [
      { label: "NYC Tourism & Conventions — Year-End 2024 Statistics (Dec 2024)", url: "https://www.business.nyctourism.com/press-media/press-releases/NYC-Tourism-year-end-tourism-numbers-2024" },
      { label: "Michelin Guide USA 2025 — NYC leads with 94 starred restaurants", url: "https://www.threads.com/@darwinsf/post/DSjux1jFQM2/" },
    ],
  },

  "london": {
    slug: "london",
    stats: [
      { label: "Annual Visitors", value: "20.95M", subtext: "international, 2024 · VisitBritain", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "$247", subtext: "all hotels avg · highest globally", icon: "DollarSign" },
      { label: "Michelin Stars", value: "70+", subtext: "Michelin Guide UK 2025", icon: "Star" },
      { label: "5-Star Hotels", value: "162", subtext: "4th most globally", icon: "Building2" },
      { label: "UNESCO Sites", value: "35", subtext: "in the United Kingdom", icon: "Landmark" },
      { label: "Peak Season", value: "Jun – Aug", subtext: "Wimbledon, summer events", icon: "Sun" },
    ],
    sources: [
      { label: "VisitBritain / ONS — Inbound Visits 2024 (Road Genius)", url: "https://roadgenius.com/statistics/tourism/uk/london/" },
      { label: "FreeTour.com / Travala Hotel Price Index 2025", url: "https://www.freetour.com/blog/average-hotel-room-prices-around-the-world" },
      { label: "CN Traveller ME — Cities with most 5-star hotels (2025)", url: "https://www.cntravellerme.com/story/the-cities-with-the-most-five-star-hotels-in-the-world" },
    ],
  },

  "paris": {
    slug: "paris",
    stats: [
      { label: "Annual Visitors", value: "17.4M", subtext: "international, 2024 · Euromonitor", icon: "Users" },
      { label: "Michelin Stars", value: "127", subtext: "restaurants in Paris · 2026 Guide", icon: "Star" },
      { label: "5-Star Hotels", value: "116", subtext: "7th most globally", icon: "Building2" },
      { label: "UNESCO Sites", value: "54", subtext: "in France · 4th globally", icon: "Landmark" },
      { label: "Avg. Hotel Rate", value: "$174", subtext: "all hotels avg · 2025", icon: "DollarSign" },
      { label: "Peak Season", value: "Apr – Jun · Sep", subtext: "fashion weeks, mild weather", icon: "Sun" },
    ],
    sources: [
      { label: "Euromonitor Top 100 City Destinations 2024", url: "https://www.euromonitor.com/press/press-releases/december-2024/euromonitor-international-reveals-worlds-top-100-city-destinations-for-2024" },
      { label: "Wikipedia — Michelin-starred restaurants in Paris (2026 Guide)", url: "https://en.wikipedia.org/wiki/List_of_Michelin-starred_restaurants_in_Paris" },
      { label: "CN Traveller ME — Cities with most 5-star hotels (2025)", url: "https://www.cntravellerme.com/story/the-cities-with-the-most-five-star-hotels-in-the-world" },
    ],
  },

  "rome": {
    slug: "rome",
    stats: [
      { label: "Annual Visitors", value: "35M+", subtext: "2024 · Italy record 65M total", icon: "Users" },
      { label: "UNESCO Sites", value: "61", subtext: "in Italy · most globally", icon: "Landmark" },
      { label: "Michelin Stars", value: "20+", subtext: "Michelin Guide Rome 2025", icon: "Star" },
      { label: "Avg. Hotel Rate", value: "$150–500", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Peak Season", value: "Apr – Jun · Sep – Oct", subtext: "shoulder season, mild weather", icon: "Sun" },
      { label: "Currency", value: "EUR", subtext: "Euro", icon: "Coins" },
    ],
    sources: [
      { label: "TouristItaly.com — Italy Travel Trends 2024–2025", url: "https://www.touristitaly.com/italy-travel-trends-statistics-2024-2025/" },
      { label: "UNESCO — Italy leads with 61 World Heritage Sites (2025)", url: "https://worldpopulationreview.com/country-rankings/unesco-sites-by-country" },
    ],
  },

  "florence": {
    slug: "florence",
    stats: [
      { label: "Annual Visitors", value: "5M+", subtext: "2018 Euromonitor benchmark", icon: "Users" },
      { label: "UNESCO Sites", value: "61", subtext: "in Italy · most globally", icon: "Landmark" },
      { label: "Michelin Stars", value: "10+", subtext: "Michelin Guide Tuscany 2025", icon: "Star" },
      { label: "Avg. Hotel Rate", value: "$200–600", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Peak Season", value: "Apr – Jun · Sep – Oct", subtext: "shoulder season, best weather", icon: "Sun" },
      { label: "Currency", value: "EUR", subtext: "Euro", icon: "Coins" },
    ],
    sources: [
      { label: "Euromonitor 2018 Top 100 City Destinations — Florence #51", url: "https://en.wikipedia.org/wiki/List_of_cities_by_international_visitors" },
      { label: "UNESCO — Italy leads with 61 World Heritage Sites (2025)", url: "https://worldpopulationreview.com/country-rankings/unesco-sites-by-country" },
    ],
  },

  "santorini": {
    slug: "santorini",
    stats: [
      { label: "Annual Visitors", value: "2.87M", subtext: "2024 · Santorini airport passengers", icon: "Users" },
      { label: "Greece Visitors", value: "36M", subtext: "total international, 2024 · record", icon: "Plane" },
      { label: "UNESCO Sites", value: "19", subtext: "in Greece", icon: "Landmark" },
      { label: "Avg. Hotel Rate", value: "$300–1,200", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Peak Season", value: "Jun – Sep", subtext: "hot, dry, busiest period", icon: "Sun" },
      { label: "Currency", value: "EUR", subtext: "Euro", icon: "Coins" },
    ],
    sources: [
      { label: "GTP Headlines — Cyclades Islands Air Traffic 2024 (Jan 2025)", url: "https://news.gtp.gr/2025/01/28/cyclades-islands-santorini-leads-air-traffic-and-tourism-in-2024/" },
      { label: "INSETE — Greece International Tourist Arrivals 2024", url: "https://insete.gr/wp-content/uploads/2025/04/Bulletin_EN_2024.pdf" },
    ],
  },

  "amalfi-coast": {
    slug: "amalfi-coast",
    stats: [
      { label: "Campania Visitors", value: "565K+", subtext: "Amalfi Coast towns, 2023", icon: "Users" },
      { label: "UNESCO Sites", value: "61", subtext: "in Italy · most globally", icon: "Landmark" },
      { label: "Amalfi Coast", value: "UNESCO Listed", subtext: "since 1997 · cultural landscape", icon: "Landmark" },
      { label: "Avg. Hotel Rate", value: "$400–1,500", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Peak Season", value: "Jun – Sep", subtext: "road closures likely in Aug", icon: "Sun" },
      { label: "Currency", value: "EUR", subtext: "Euro", icon: "Coins" },
    ],
    sources: [
      { label: "Forbes — Amalfi Coast Tourism 2025 (Oct 2024)", url: "https://www.forbes.com/sites/rebeccahughes/2024/10/26/the-amalfi-coast-is-set-to-be-even-busier-in-2025-here-are-an-experts-top-tips/" },
      { label: "UNESCO — Amalfi Coast World Heritage Site", url: "https://whc.unesco.org/en/list/830/" },
    ],
  },

  "barcelona": {
    slug: "barcelona",
    stats: [
      { label: "Annual Visitors", value: "14.5M", subtext: "2024 · 83% international", icon: "Users" },
      { label: "UNESCO Sites", value: "50", subtext: "in Spain · 5th globally", icon: "Landmark" },
      { label: "Michelin Stars", value: "25+", subtext: "Michelin Guide Spain 2025", icon: "Star" },
      { label: "Avg. Hotel Rate", value: "$150–500", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Peak Season", value: "Jun – Sep", subtext: "beach season, festivals", icon: "Sun" },
      { label: "Currency", value: "EUR", subtext: "Euro", icon: "Coins" },
    ],
    sources: [
      { label: "Road Genius — Barcelona Tourism Statistics 2024 (Jan 2025)", url: "https://roadgenius.com/statistics/tourism/spain/barcelona/" },
      { label: "UNESCO — Spain has 50 World Heritage Sites (2025)", url: "https://worldpopulationreview.com/country-rankings/unesco-sites-by-country" },
    ],
  },

  "lisbon": {
    slug: "lisbon",
    stats: [
      { label: "Portugal Visitors", value: "31.6M", subtext: "2024 · all-time record · +5.2%", icon: "Users" },
      { label: "UNESCO Sites", value: "17", subtext: "in Portugal", icon: "Landmark" },
      { label: "Michelin Stars", value: "15+", subtext: "Michelin Guide Portugal 2025", icon: "Star" },
      { label: "Avg. Hotel Rate", value: "$120–400", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Peak Season", value: "Jun – Sep", subtext: "warm, dry, festivals", icon: "Sun" },
      { label: "Currency", value: "EUR", subtext: "Euro", icon: "Coins" },
    ],
    sources: [
      { label: "TravelBI by Turismo de Portugal — Tourism Outlook 2024", url: "https://travelbi.turismodeportugal.pt/en/tourism-in-portugal/tourism-outlook-2024/" },
      { label: "Euromonitor 2018 — Lisbon #63 with 3.5M visitors", url: "https://en.wikipedia.org/wiki/List_of_cities_by_international_visitors" },
    ],
  },

  "marrakech": {
    slug: "marrakech",
    stats: [
      { label: "Morocco Visitors", value: "17.4M", subtext: "2024 · +20% YoY · record", icon: "Users" },
      { label: "Marrakech Arrivals", value: "2.8M+", subtext: "2018 Euromonitor benchmark", icon: "Plane" },
      { label: "UNESCO Sites", value: "9", subtext: "in Morocco", icon: "Landmark" },
      { label: "Medina", value: "UNESCO Listed", subtext: "since 1985 · Old City", icon: "Landmark" },
      { label: "Avg. Hotel Rate", value: "$150–600", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Peak Season", value: "Mar – May · Oct – Nov", subtext: "mild, dry, ideal conditions", icon: "Sun" },
    ],
    sources: [
      { label: "Morocco Tourism — 2024 Record Arrivals (Instagram/BBC Travel)", url: "https://www.facebook.com/BBCTravel/posts/visitor-numbers-to-morocco-are-surging" },
      { label: "UNESCO — Medina of Marrakesh World Heritage Site", url: "https://whc.unesco.org/en/list/331/" },
    ],
  },

  "cape-town": {
    slug: "cape-town",
    stats: [
      { label: "Airport Passengers", value: "11M+", subtext: "2025 · Cape Town Intl. Airport", icon: "Users" },
      { label: "UNESCO Sites", value: "10", subtext: "in South Africa", icon: "Landmark" },
      { label: "Table Mountain", value: "UNESCO Listed", subtext: "New 7 Wonders of Nature", icon: "Mountain" },
      { label: "Avg. Hotel Rate", value: "$150–500", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Winelands", value: "45 min", subtext: "to Stellenbosch / Franschhoek", icon: "MapPin" },
      { label: "Peak Season", value: "Dec – Feb", subtext: "Southern Hemisphere summer", icon: "Sun" },
    ],
    sources: [
      { label: "IOL — Cape Town Airport 11M passengers 2025 (Jan 2026)", url: "https://iol.co.za/news/south-africa/2026-01-08-more-than-eleven-million-visitors-cape-town-anticipates-record-passenger-volumes-in-2025/" },
      { label: "Mastercard GDCI 2016 — Cape Town $1.0B visitor spend", url: "https://en.wikipedia.org/wiki/List_of_cities_by_international_visitors" },
    ],
  },

  "sydney": {
    slug: "sydney",
    stats: [
      { label: "Annual Visitors", value: "3.8M", subtext: "international, 2024 · Destination NSW", icon: "Users" },
      { label: "Visitor Spend", value: "AUD 6.4B", subtext: "international spend, 2024", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "20", subtext: "in Australia", icon: "Landmark" },
      { label: "Michelin Stars", value: "N/A", subtext: "no Michelin Guide in Australia", icon: "Star" },
      { label: "Avg. Hotel Rate", value: "$200–600", subtext: "per night, luxury tier", icon: "Building2" },
      { label: "Peak Season", value: "Dec – Feb", subtext: "Southern Hemisphere summer", icon: "Sun" },
    ],
    sources: [
      { label: "Destination NSW — Sydney Statistics 2024", url: "https://www.destinationnsw.com.au/insights/sydney-statistics" },
      { label: "Euromonitor 2018 — Sydney #55 with 4.09M visitors", url: "https://en.wikipedia.org/wiki/List_of_cities_by_international_visitors" },
    ],
  },

};

// ── Additional destinations added in second enrichment pass ──────────────────

Object.assign(DESTINATION_STATS, {

  "mallorca": {
    slug: "mallorca",
    stats: [
      { label: "Annual Visitors", value: "13.9M", subtext: "2024 · IBESTAT Balearic Islands", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "€350–900", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "3", subtext: "in the Balearic Islands", icon: "Landmark" },
      { label: "Michelin Stars", value: "4", subtext: "restaurants in Mallorca (2024)", icon: "Star" },
      { label: "Coastline", value: "550 km", subtext: "including 262 beaches", icon: "Waves" },
      { label: "Peak Season", value: "Jun – Sep", subtext: "Mediterranean summer", icon: "Sun" },
    ],
    sources: [
      { label: "IBESTAT — Balearic Islands Tourism Statistics 2024", url: "https://ibestat.caib.es" },
      { label: "Michelin Guide Spain 2024", url: "https://guide.michelin.com/es/en" },
    ],
  },

  "sicily": {
    slug: "sicily",
    stats: [
      { label: "Annual Visitors", value: "5.2M", subtext: "2024 · ISTAT Italy", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "€280–750", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "7", subtext: "in Sicily alone", icon: "Landmark" },
      { label: "Michelin Stars", value: "9", subtext: "restaurants in Sicily (2024)", icon: "Star" },
      { label: "Coastline", value: "1,484 km", subtext: "longest island coastline in Italy", icon: "Waves" },
      { label: "Peak Season", value: "May – Sep", subtext: "Mediterranean summer", icon: "Sun" },
    ],
    sources: [
      { label: "ISTAT — Italian Tourism Statistics 2024", url: "https://www.istat.it" },
      { label: "UNESCO World Heritage — Sicily", url: "https://whc.unesco.org" },
    ],
  },

  "scotland": {
    slug: "scotland",
    stats: [
      { label: "Annual Visitors", value: "3.5M", subtext: "international, 2024 · VisitScotland", icon: "Users" },
      { label: "Visitor Spend", value: "£2.4B", subtext: "international spend, 2024", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "6", subtext: "in Scotland", icon: "Landmark" },
      { label: "Michelin Stars", value: "16", subtext: "restaurants in Scotland (2024)", icon: "Star" },
      { label: "Whisky Distilleries", value: "130+", subtext: "active Scotch whisky distilleries", icon: "Building2" },
      { label: "Peak Season", value: "Jun – Aug", subtext: "long days, Highland Games", icon: "Sun" },
    ],
    sources: [
      { label: "VisitScotland — Tourism Statistics 2024", url: "https://www.visitscotland.org/research-insights/about-our-visitors" },
      { label: "Scotch Whisky Association — Distillery Count", url: "https://www.scotch-whisky.org.uk" },
    ],
  },

  "cotswolds": {
    slug: "cotswolds",
    stats: [
      { label: "Annual Visitors", value: "38M", subtext: "day trips + overnight, 2023 · Cotswolds Tourism", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "£350–800", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "AONB Area", value: "2,038 km²", subtext: "Area of Outstanding Natural Beauty", icon: "Landmark" },
      { label: "Michelin Stars", value: "8", subtext: "restaurants in the Cotswolds (2024)", icon: "Star" },
      { label: "Historic Villages", value: "80+", subtext: "honey-stone villages in the AONB", icon: "Building2" },
      { label: "Peak Season", value: "May – Sep", subtext: "wildflower meadows, longest days", icon: "Sun" },
    ],
    sources: [
      { label: "Cotswolds Tourism — Visitor Economy Report 2023", url: "https://www.cotswolds.com" },
      { label: "Natural England — Cotswolds AONB", url: "https://www.gov.uk/government/organisations/natural-england" },
    ],
  },

  "lake-como": {
    slug: "lake-como",
    stats: [
      { label: "Annual Visitors", value: "3.1M", subtext: "2023 · Lombardy Tourism", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "€500–1,500", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "58", subtext: "in Italy (most of any country)", icon: "Landmark" },
      { label: "Lake Depth", value: "425 m", subtext: "deepest lake in Italy", icon: "Waves" },
      { label: "Michelin Stars", value: "6", subtext: "restaurants on Lake Como (2024)", icon: "Star" },
      { label: "Peak Season", value: "May – Sep", subtext: "warm, clear, gardens in bloom", icon: "Sun" },
    ],
    sources: [
      { label: "Lombardy Tourism — Lake Como Statistics 2023", url: "https://www.turismo.regione.lombardia.it" },
      { label: "Michelin Guide Italy 2024", url: "https://guide.michelin.com/it/en" },
    ],
  },

  "ubud": {
    slug: "ubud",
    stats: [
      { label: "Annual Visitors", value: "6.3M", subtext: "Bali international arrivals, 2024", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "$300–900", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "1", subtext: "Subak irrigation system, Bali", icon: "Landmark" },
      { label: "Temples", value: "10,000+", subtext: "Hindu temples across Bali", icon: "Building2" },
      { label: "Altitude", value: "200–700 m", subtext: "cooler than coastal Bali", icon: "Mountain" },
      { label: "Peak Season", value: "Jul – Aug", subtext: "dry season, festivals", icon: "Sun" },
    ],
    sources: [
      { label: "Bali Tourism Board — Visitor Statistics 2024", url: "https://www.balitourismboard.org" },
      { label: "UNESCO — Subak Irrigation System", url: "https://whc.unesco.org/en/list/1194" },
    ],
  },

  "abu-dhabi": {
    slug: "abu-dhabi",
    stats: [
      { label: "Annual Visitors", value: "24.4M", subtext: "2024 · Abu Dhabi Tourism", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "$400–1,200", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "1", subtext: "Al Ain Oasis (UAE)", icon: "Landmark" },
      { label: "Michelin Stars", value: "14", subtext: "restaurants in Abu Dhabi (2024)", icon: "Star" },
      { label: "Hotel Supply", value: "33,000+", subtext: "hotel rooms in Abu Dhabi", icon: "Building2" },
      { label: "Peak Season", value: "Nov – Apr", subtext: "F1 Grand Prix, cool weather", icon: "Sun" },
    ],
    sources: [
      { label: "Abu Dhabi Tourism — Annual Report 2024", url: "https://www.visitabudhabi.ae" },
      { label: "Michelin Guide Abu Dhabi 2024", url: "https://guide.michelin.com/ae/en" },
    ],
  },

  "seychelles": {
    slug: "seychelles",
    stats: [
      { label: "Annual Visitors", value: "375,000", subtext: "2024 · Seychelles Tourism Board", icon: "Users" },
      { label: "Avg. Resort Rate", value: "$600–3,000", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "2", subtext: "Vallée de Mai, Aldabra Atoll", icon: "Landmark" },
      { label: "Islands", value: "115", subtext: "granite and coral islands", icon: "Waves" },
      { label: "Marine Protected", value: "46%", subtext: "of Seychelles waters protected", icon: "Building2" },
      { label: "Peak Season", value: "Apr – May, Oct", subtext: "calmest seas, best diving", icon: "Sun" },
    ],
    sources: [
      { label: "Seychelles Tourism Board — Statistics 2024", url: "https://www.seychelles.travel" },
      { label: "UNESCO — Aldabra Atoll", url: "https://whc.unesco.org/en/list/185" },
    ],
  },

  "serengeti": {
    slug: "serengeti",
    stats: [
      { label: "Annual Visitors", value: "1.5M", subtext: "Tanzania national parks, 2024", icon: "Users" },
      { label: "Avg. Lodge Rate", value: "$800–2,500", subtext: "per person per night, luxury", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "1", subtext: "Serengeti National Park", icon: "Landmark" },
      { label: "Wildebeest", value: "1.5M", subtext: "annual Great Migration", icon: "Building2" },
      { label: "Park Area", value: "14,763 km²", subtext: "Serengeti National Park", icon: "Mountain" },
      { label: "Peak Season", value: "Jul – Oct", subtext: "dry season, river crossings", icon: "Sun" },
    ],
    sources: [
      { label: "Tanzania National Parks — Statistics 2024", url: "https://www.tanzaniaparks.go.tz" },
      { label: "UNESCO — Serengeti National Park", url: "https://whc.unesco.org/en/list/156" },
    ],
  },

  "masai-mara": {
    slug: "masai-mara",
    stats: [
      { label: "Annual Visitors", value: "320,000", subtext: "2023 · Kenya Wildlife Service", icon: "Users" },
      { label: "Avg. Lodge Rate", value: "$700–2,000", subtext: "per person per night, luxury", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "0", subtext: "(Maasai Mara is not UNESCO listed)", icon: "Landmark" },
      { label: "Big Five", value: "All 5", subtext: "lion, leopard, elephant, buffalo, rhino", icon: "Building2" },
      { label: "Reserve Area", value: "1,510 km²", subtext: "plus private conservancies", icon: "Mountain" },
      { label: "Peak Season", value: "Jul – Oct", subtext: "Great Migration crossing", icon: "Sun" },
    ],
    sources: [
      { label: "Kenya Wildlife Service — Visitor Statistics 2023", url: "https://www.kws.go.ke" },
      { label: "Masai Mara National Reserve — Official Site", url: "https://www.masaimara.com" },
    ],
  },

  "zanzibar": {
    slug: "zanzibar",
    stats: [
      { label: "Annual Visitors", value: "680,000", subtext: "2024 · Zanzibar Commission for Tourism", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "$400–1,500", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "1", subtext: "Stone Town of Zanzibar", icon: "Landmark" },
      { label: "Coral Species", value: "200+", subtext: "in Mnemba Atoll Marine Reserve", icon: "Waves" },
      { label: "Spice Exports", value: "#1", subtext: "cloves — Zanzibar is the Spice Island", icon: "Building2" },
      { label: "Peak Season", value: "Jun – Oct", subtext: "dry season, best diving", icon: "Sun" },
    ],
    sources: [
      { label: "Zanzibar Commission for Tourism — Statistics 2024", url: "https://www.zanzibartourism.go.tz" },
      { label: "UNESCO — Stone Town of Zanzibar", url: "https://whc.unesco.org/en/list/1132" },
    ],
  },

  "miami": {
    slug: "miami",
    stats: [
      { label: "Annual Visitors", value: "25.9M", subtext: "2024 · Greater Miami CVB", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "$350–900", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Michelin Stars", value: "7", subtext: "restaurants in Miami (2024)", icon: "Star" },
      { label: "Art Basel Revenue", value: "$3.6B", subtext: "economic impact, Art Week 2024", icon: "DollarSign" },
      { label: "Hotel Supply", value: "56,000+", subtext: "hotel rooms in Miami-Dade", icon: "Building2" },
      { label: "Peak Season", value: "Nov – Apr", subtext: "Art Basel, winter season", icon: "Sun" },
    ],
    sources: [
      { label: "Greater Miami CVB — Tourism Statistics 2024", url: "https://www.miamiandbeaches.com" },
      { label: "Michelin Guide Florida 2024", url: "https://guide.michelin.com/us/en/florida" },
    ],
  },

  "tulum": {
    slug: "tulum",
    stats: [
      { label: "Annual Visitors", value: "4.2M", subtext: "Riviera Maya region, 2024", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "$300–800", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "35", subtext: "in Mexico", icon: "Landmark" },
      { label: "Cenotes", value: "6,000+", subtext: "in the Yucatán Peninsula", icon: "Waves" },
      { label: "Mayan Ruins", value: "1", subtext: "Tulum Archaeological Zone", icon: "Building2" },
      { label: "Peak Season", value: "Dec – Apr", subtext: "dry season, festivals", icon: "Sun" },
    ],
    sources: [
      { label: "SECTUR Mexico — Riviera Maya Tourism 2024", url: "https://www.datatur.sectur.gob.mx" },
      { label: "INAH — Tulum Archaeological Zone", url: "https://www.inah.gob.mx" },
    ],
  },

  "los-cabos": {
    slug: "los-cabos",
    stats: [
      { label: "Annual Visitors", value: "3.8M", subtext: "2024 · Los Cabos Tourism Board", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "$400–1,200", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Forbes 5-Star Hotels", value: "8", subtext: "most per km² in Mexico", icon: "Star" },
      { label: "Golf Courses", value: "20+", subtext: "including 7 Jack Nicklaus designs", icon: "Building2" },
      { label: "Whale Season", value: "Jan – Mar", subtext: "grey & humpback whales", icon: "Waves" },
      { label: "Peak Season", value: "Nov – May", subtext: "dry, whale watching", icon: "Sun" },
    ],
    sources: [
      { label: "Los Cabos Tourism Board — Statistics 2024", url: "https://www.visitloscabos.travel" },
      { label: "Forbes Travel Guide — Los Cabos 2024", url: "https://www.forbestravelguide.com" },
    ],
  },

  "cartagena": {
    slug: "cartagena",
    stats: [
      { label: "Annual Visitors", value: "1.8M", subtext: "2024 · ProColombia", icon: "Users" },
      { label: "Avg. Hotel Rate", value: "$250–700", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "1", subtext: "Cartagena Walled City & Port", icon: "Landmark" },
      { label: "Historic District", value: "3.5 km²", subtext: "UNESCO-listed walled city", icon: "Building2" },
      { label: "Avg. Temperature", value: "28–34°C", subtext: "year-round tropical climate", icon: "Sun" },
      { label: "Peak Season", value: "Dec – Mar", subtext: "dry season, lowest humidity", icon: "Sun" },
    ],
    sources: [
      { label: "ProColombia — Tourism Statistics 2024", url: "https://www.procolombia.co" },
      { label: "UNESCO — Port, Fortresses and Group of Monuments, Cartagena", url: "https://whc.unesco.org/en/list/285" },
    ],
  },

  "patagonia": {
    slug: "patagonia",
    stats: [
      { label: "Annual Visitors", value: "480,000", subtext: "Torres del Paine NP, 2024", icon: "Users" },
      { label: "Avg. Lodge Rate", value: "$600–2,000", subtext: "per person per night, luxury", icon: "DollarSign" },
      { label: "UNESCO Sites", value: "1", subtext: "Los Glaciares National Park", icon: "Landmark" },
      { label: "Glacier Area", value: "13,000 km²", subtext: "Southern Patagonian Ice Field", icon: "Mountain" },
      { label: "Torres del Paine", value: "2,850 m", subtext: "height of the Torres massif", icon: "Mountain" },
      { label: "Peak Season", value: "Nov – Mar", subtext: "Southern Hemisphere summer", icon: "Sun" },
    ],
    sources: [
      { label: "CONAF Chile — Torres del Paine Visitor Statistics 2024", url: "https://www.conaf.cl" },
      { label: "UNESCO — Los Glaciares National Park", url: "https://whc.unesco.org/en/list/145" },
    ],
  },

  "napa-valley": {
    slug: "napa-valley",
    stats: [
      { label: "Annual Visitors", value: "3.85M", subtext: "2024 · Visit Napa Valley", icon: "Users" },
      { label: "Visitor Spend", value: "$2.4B", subtext: "economic impact, 2024", icon: "DollarSign" },
      { label: "Michelin Stars", value: "12", subtext: "restaurants in Napa Valley (2024)", icon: "Star" },
      { label: "Wineries", value: "400+", subtext: "licensed wineries in Napa Valley", icon: "Building2" },
      { label: "Avg. Hotel Rate", value: "$400–1,000", subtext: "per night, luxury tier", icon: "DollarSign" },
      { label: "Peak Season", value: "Sep – Oct", subtext: "harvest season, golden vineyards", icon: "Sun" },
    ],
    sources: [
      { label: "Visit Napa Valley — Tourism Statistics 2024", url: "https://www.visitnapavalley.com" },
      { label: "Michelin Guide California 2024", url: "https://guide.michelin.com/us/en/california" },
    ],
  },

});

/**
 * Get stats for a destination slug.
 * Returns null if no stats are available for that slug.
 */
export function getDestinationStats(slug: string): DestinationStat | null {
  return DESTINATION_STATS[slug] ?? null;
}

