import { createContext, useContext } from 'react';

/** Is the phone layout active? (chosen by viewport width, overridable in settings) */
export const MobileCtx = createContext(false);
export const useMobile = () => useContext(MobileCtx);
