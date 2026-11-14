import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import './ui/styles.css';
import './ui/town.css';
import './ui/scene.css';
import './ui/book.css';
import './ui/jobs/jobs.css';
import './ui/jobs/scene.css';
import { loadBundledLists } from './curriculum/browser';

// The compiled English lists are decompressed once before the game data is built (a few ms);
// without them the game still runs (the 現在地 page says the lists are missing).
loadBundledLists().finally(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);
