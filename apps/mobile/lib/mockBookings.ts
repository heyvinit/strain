import { mockRaces, type Race } from './mockRaces';

export type BookingStatus = 'registered' | 'waitlist' | 'bib-released' | 'race-week' | 'completed';

export type Booking = {
  id: string;
  race: Race;
  status: BookingStatus;
  bib?: string;
  wave?: string;
  daysOut: number;
  nextMilestone?: string;
};

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    race: mockRaces[3],
    status: 'bib-released',
    bib: '4821',
    wave: 'Wave B · 06:25',
    daysOut: 12,
    nextMilestone: 'Bib pickup opens Wed',
  },
  {
    id: 'b2',
    race: mockRaces[4],
    status: 'registered',
    daysOut: 19,
    nextMilestone: 'Wave selection opens 2 Feb',
  },
  {
    id: 'b3',
    race: mockRaces[0],
    status: 'race-week',
    bib: '12092',
    wave: 'Elite · 05:30',
    daysOut: 3,
    nextMilestone: 'Race kit pickup tomorrow',
  },
];

export type PassportStamp = {
  id: string;
  race: Race;
  finishTime: string;
  position: string;
  year: number;
};

export const mockPassport: PassportStamp[] = [
  {
    id: 's1',
    race: mockRaces[5],
    finishTime: '00:42:18',
    position: '128 / 1,204',
    year: 2025,
  },
  {
    id: 's2',
    race: mockRaces[2],
    finishTime: '03:08:42',
    position: '42 / 418',
    year: 2025,
  },
  {
    id: 's3',
    race: mockRaces[7],
    finishTime: '11:24:09',
    position: '312 / 1,800',
    year: 2025,
  },
  {
    id: 's4',
    race: mockRaces[8],
    finishTime: '00:39:55',
    position: '88 / 1,030',
    year: 2024,
  },
  {
    id: 's5',
    race: mockRaces[1],
    finishTime: '01:14:08',
    position: '64 / 920',
    year: 2024,
  },
];
