import { useUi } from '../uiState';
import { NotebookView } from './NotebookView';
import { RecipeBookView } from './RecipeBookView';
import { CatalogueView } from '../reno/CatalogueView';

/** Whichever book is open, over any screen (shop, market, delivery). */
export function BookLayer() {
  const ui = useUi();
  if (ui.book === 'recipe') return <RecipeBookView />;
  if (ui.book === 'notebook') return <NotebookView />;
  if (ui.book === 'catalogue') return <CatalogueView />;
  return null;
}
