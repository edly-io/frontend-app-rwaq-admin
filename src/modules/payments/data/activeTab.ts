import { createContext } from 'react';

/**
 * Whether the tab a component sits in is the one on screen. A tab stays
 * mounted once opened so it keeps its own state, but a hidden one must not
 * keep querying. True outside a tab, so a component used on its own fetches.
 */
export const ActiveTabContext = createContext(true);
