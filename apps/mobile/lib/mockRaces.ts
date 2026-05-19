export type Sport =
  | 'Marathon'
  | 'Half Marathon'
  | 'Hyrox'
  | 'Ironman 70.3'
  | 'Ironman'
  | 'Trail'
  | 'Ultra'
  | '10K';

export type HypeSignal = {
  label: string;
  tone: 'urgent' | 'social' | 'neutral';
};

export type Race = {
  id: string;
  name: string;
  sport: Sport;
  distanceLabel: string;
  date: string;
  dateShort: string;
  city: string;
  venue: string;
  country: string;
  lat: number;
  lng: number;
  priceFrom: string;
  heroImage: string;
  hype: HypeSignal;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  tint: string;
};

export const banners: Banner[] = [
  {
    id: 'b1',
    title: 'Dubai Marathon 2026',
    subtitle: 'Registration closes Sunday',
    cta: 'Reserve a spot',
    image: 'https://images.unsplash.com/photo-1530137073521-28cda9e5d3b9?auto=format&fit=crop&w=1200&q=70',
    tint: '#0F2342',
  },
  {
    id: 'b2',
    title: 'Hyrox Abu Dhabi',
    subtitle: 'New venue, Yas Marina',
    cta: 'See the lineup',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=70',
    tint: '#1E1B2E',
  },
  {
    id: 'b3',
    title: 'Strain Club perks',
    subtitle: 'Early access on premium races',
    cta: 'Join the club',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=70',
    tint: '#0A0A0A',
  },
];

export const mockRaces: Race[] = [
  {
    id: 'r1',
    name: 'Dubai Marathon',
    sport: 'Marathon',
    distanceLabel: '42K',
    date: '12 April 2026',
    dateShort: '12 Apr',
    city: 'Dubai',
    venue: 'Expo City',
    country: 'UAE',
    lat: 24.96,
    lng: 55.15,
    priceFrom: 'AED 320',
    heroImage: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1000&q=70',
    hype: { label: 'Closes in 3d', tone: 'urgent' },
  },
  {
    id: 'r2',
    name: 'Hyrox Abu Dhabi Pro',
    sport: 'Hyrox',
    distanceLabel: 'Pro',
    date: '03 May 2026',
    dateShort: '03 May',
    city: 'Abu Dhabi',
    venue: 'Yas Marina',
    country: 'UAE',
    lat: 24.467,
    lng: 54.605,
    priceFrom: 'AED 480',
    heroImage: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=70',
    hype: { label: 'Selling fast', tone: 'urgent' },
  },
  {
    id: 'r3',
    name: 'Hatta Trail 30K',
    sport: 'Trail',
    distanceLabel: '30K',
    date: '21 February 2026',
    dateShort: '21 Feb',
    city: 'Hatta',
    venue: 'Hatta Mountain Reserve',
    country: 'UAE',
    lat: 24.793,
    lng: 56.124,
    priceFrom: 'AED 260',
    heroImage: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=1000&q=70',
    hype: { label: '420 registered', tone: 'social' },
  },
  {
    id: 'r4',
    name: 'Ironman 70.3 Dubai',
    sport: 'Ironman 70.3',
    distanceLabel: '70.3 mi',
    date: '07 February 2026',
    dateShort: '07 Feb',
    city: 'Dubai',
    venue: 'JBR Beach',
    country: 'UAE',
    lat: 25.078,
    lng: 55.135,
    priceFrom: 'AED 1,650',
    heroImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1000&q=70',
    hype: { label: 'Closes in 9d', tone: 'urgent' },
  },
  {
    id: 'r5',
    name: 'RAK Half Marathon',
    sport: 'Half Marathon',
    distanceLabel: '21K',
    date: '14 February 2026',
    dateShort: '14 Feb',
    city: 'Ras Al Khaimah',
    venue: 'Al Marjan Island',
    country: 'UAE',
    lat: 25.683,
    lng: 55.787,
    priceFrom: 'AED 220',
    heroImage: 'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=1000&q=70',
    hype: { label: 'World record course', tone: 'social' },
  },
  {
    id: 'r6',
    name: 'Sharjah Sunset 10K',
    sport: '10K',
    distanceLabel: '10K',
    date: '28 March 2026',
    dateShort: '28 Mar',
    city: 'Sharjah',
    venue: 'Al Majaz Waterfront',
    country: 'UAE',
    lat: 25.327,
    lng: 55.388,
    priceFrom: 'AED 95',
    heroImage: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1000&q=70',
    hype: { label: '1.2k registered', tone: 'social' },
  },
  {
    id: 'r7',
    name: 'Wadi Adventure Ultra',
    sport: 'Ultra',
    distanceLabel: '50K',
    date: '17 January 2026',
    dateShort: '17 Jan',
    city: 'Al Ain',
    venue: 'Wadi Adventure',
    country: 'UAE',
    lat: 24.183,
    lng: 55.755,
    priceFrom: 'AED 540',
    heroImage: 'https://images.unsplash.com/photo-1502810365585-7d9b29bb35b3?auto=format&fit=crop&w=1000&q=70',
    hype: { label: 'Bibs limited', tone: 'urgent' },
  },
  {
    id: 'r8',
    name: 'Ironman UAE',
    sport: 'Ironman',
    distanceLabel: '140.6 mi',
    date: '10 January 2026',
    dateShort: '10 Jan',
    city: 'Abu Dhabi',
    venue: 'Yas Island',
    country: 'UAE',
    lat: 24.495,
    lng: 54.605,
    priceFrom: 'AED 2,950',
    heroImage: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=1000&q=70',
    hype: { label: 'Pro card eligible', tone: 'social' },
  },
  {
    id: 'r9',
    name: 'Jumeirah Beach 10K',
    sport: '10K',
    distanceLabel: '10K',
    date: '04 April 2026',
    dateShort: '04 Apr',
    city: 'Dubai',
    venue: 'La Mer South',
    country: 'UAE',
    lat: 25.21,
    lng: 55.255,
    priceFrom: 'AED 110',
    heroImage: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=1000&q=70',
    hype: { label: 'New for 2026', tone: 'neutral' },
  },
];
