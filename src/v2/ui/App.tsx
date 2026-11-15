/** v2 root: the start screen, or where the player is: the workplace (one screen all day), the town, the market. */
import { ArtDefs } from '../../ui/art/defs';
import { Clinic } from './clinic';
import { Market } from './market';
import { Start } from './start';
import { GameProvider, useGame } from './store';
import { TeaHouse } from './tea';
import { Town } from './town';

function Screen() {
  const { s } = useGame();
  if (!s) return <Start />;
  const { room, workplace } = s.day;
  if (room === 'town') return <Town />;
  if (room === 'market') return <Market />;
  return workplace === 'clinic' ? <Clinic /> : <TeaHouse />;
}

export function App() {
  return (
    <GameProvider>
      <ArtDefs />
      <Screen />
    </GameProvider>
  );
}
