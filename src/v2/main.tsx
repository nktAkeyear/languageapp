import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadBundledLists } from '../curriculum/browser';
import { App } from './ui/App';
import './v2.css';

// The compiled English lists are unpacked once before the game data is built (levels for the start choice).
loadBundledLists().finally(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);
