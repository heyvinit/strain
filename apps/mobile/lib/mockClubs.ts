export type RunVibe = 'easy' | 'tempo' | 'long' | 'track' | 'social';

export type Club = {
  id: string;
  name: string;
  handle: string;
  city: string;
  vibe: RunVibe;
  vibeLabel: string;
  members: number;
  logo: string;
  cover: string;
  about: string;
};

export type ClubRun = {
  id: string;
  clubId: string;
  clubName: string;
  clubLogo: string;
  title: string;
  date: string;
  dayLabel: string;
  time: string;
  meeting: string;
  city: string;
  lat: number;
  lng: number;
  distanceKm: number;
  pace: string;
  attendees: number;
  gallery: string[];
  description: string;
  going?: boolean;
};

export const mockClubs: Club[] = [
  {
    id: 'c1',
    name: 'LFG Club',
    handle: '@lfg.run',
    city: 'Dubai',
    vibe: 'easy',
    vibeLabel: 'Sunrise 5K easy',
    members: 412,
    logo: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=300&q=70',
    cover: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=1200&q=70',
    about: 'Twice-weekly easy runs along Kite Beach. Everyone welcome, no drop policy.',
  },
  {
    id: 'c2',
    name: 'J.Jhones',
    handle: '@jjhones.run',
    city: 'Dubai',
    vibe: 'tempo',
    vibeLabel: 'Tempo Tuesdays',
    members: 187,
    logo: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=300&q=70',
    cover: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=70',
    about: 'Track-focused, mid-pack and faster. Run a 24-minute 5K to keep up.',
  },
  {
    id: 'c3',
    name: 'AVG Run Club',
    handle: '@avg.run',
    city: 'Abu Dhabi',
    vibe: 'social',
    vibeLabel: 'Slow & social',
    members: 96,
    logo: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=300&q=70',
    cover: 'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=1200&q=70',
    about: 'For people who hated PE. We run, we walk, we get coffee.',
  },
  {
    id: 'c4',
    name: 'Stride Co.',
    handle: '@stride.co',
    city: 'Dubai',
    vibe: 'long',
    vibeLabel: 'Sunday long runs',
    members: 233,
    logo: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=300&q=70',
    cover: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=70',
    about: 'Marathon-training pack. Long runs from 15K to 35K through the season.',
  },
];

const KITE_GALLERY = [
  'https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=70',
];

export const mockClubRuns: ClubRun[] = [
  {
    id: 'cr1',
    clubId: 'c1',
    clubName: 'LFG Club',
    clubLogo: mockClubs[0].logo,
    title: 'Sunrise 5K — Kite Beach',
    date: '2026-05-21',
    dayLabel: 'Tue 21',
    time: '5:45 AM',
    meeting: 'Kite Beach, Dubai',
    city: 'Dubai',
    lat: 25.1359,
    lng: 55.1942,
    distanceKm: 5,
    pace: '5:30–6:30 /km',
    attendees: 23,
    gallery: KITE_GALLERY,
    description:
      'Easy 5K along the boardwalk. Two groups: chatty and slightly less chatty. Coffee after at Common Grounds.',
    going: true,
  },
  {
    id: 'cr2',
    clubId: 'c2',
    clubName: 'J.Jhones',
    clubLogo: mockClubs[1].logo,
    title: 'Tempo Tuesday — DXB Hills',
    date: '2026-05-21',
    dayLabel: 'Tue 21',
    time: '6:00 PM',
    meeting: 'Hills Park, Dubai',
    city: 'Dubai',
    lat: 25.1011,
    lng: 55.2487,
    distanceKm: 8,
    pace: '4:30–5:00 /km',
    attendees: 14,
    gallery: KITE_GALLERY,
    description: '8K progression. Bring water, we have one fountain stop.',
  },
  {
    id: 'cr3',
    clubId: 'c4',
    clubName: 'Stride Co.',
    clubLogo: mockClubs[3].logo,
    title: 'Long Run — JBR Loop',
    date: '2026-05-25',
    dayLabel: 'Sun 25',
    time: '5:30 AM',
    meeting: 'JBR Beach, Tower 1',
    city: 'Dubai',
    lat: 25.0789,
    lng: 55.1335,
    distanceKm: 22,
    pace: '5:00–5:30 /km',
    attendees: 31,
    gallery: KITE_GALLERY,
    description: '22K out-and-back. Aid station at 11K. Cap of 40 runners.',
  },
  {
    id: 'cr4',
    clubId: 'c3',
    clubName: 'AVG Run Club',
    clubLogo: mockClubs[2].logo,
    title: 'Sunset Social — Corniche',
    date: '2026-05-23',
    dayLabel: 'Fri 23',
    time: '6:30 PM',
    meeting: 'Abu Dhabi Corniche',
    city: 'Abu Dhabi',
    lat: 24.4762,
    lng: 54.3275,
    distanceKm: 4,
    pace: '7:00 /km',
    attendees: 9,
    gallery: KITE_GALLERY,
    description: 'Slowest 4K of your week. Strictly conversational pace.',
  },
];
