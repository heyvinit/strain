import type { Race } from '@/lib/mockRaces';

type Props = {
  races: Race[];
  selectedId: string | null;
  onSelect: (raceId: string) => void;
};

declare const RaceMap: (props: Props) => JSX.Element;
export default RaceMap;
