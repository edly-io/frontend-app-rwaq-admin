/**
 * StatsTiles — the row of number tiles of a strip. Each child is a StatTile or a KpiCard.
 */
import { ReactNode } from 'react';

const StatsTiles = ({ children }: { children: ReactNode }) => (
  <div className="rwaq-dash-grid rwaq-dash-grid--kpi rwaq-stats-tiles">{children}</div>
);

/** One tile in its card, so the figure and its label sit on the same surface as the charts. */
export const StatsTileCard = ({ children }: { children: ReactNode }) => (
  <div className="rwaq-card">{children}</div>
);

export default StatsTiles;
