/** v2 root: the start screen, or today's room (Back / Front of the workplace, the town, the market). */
import { ArtDefs } from '../../ui/art/defs';
import { ClinicBack, ClinicDesk } from './clinic';
import { Market } from './market';
import { Start } from './start';
import { GameProvider, useGame } from './store';
import { TeaBack, TeaFront } from './tea';
import { Town } from './town';

function Screen() {
  const { s } = useGame();
  if (!s) return <Start />;
  const { room, workplace } = s.day;
  if (room === 'town') return <Town />;
  if (room === 'market') return <Market />;
  if (workplace === 'clinic') return room === 'front' ? <ClinicDesk /> : <ClinicBack />;
  return room === 'front' ? <TeaFront /> : <TeaBack />;
}

export function App() {
  return (
    <GameProvider>
      <ArtDefs />
      <Screen />
    </GameProvider>
  );
}
