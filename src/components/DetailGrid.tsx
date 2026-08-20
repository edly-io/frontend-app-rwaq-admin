/**
 * Label/value pairs in a responsive two-column grid.
 *
 * A read-only detail view is a *table* of facts, not a form: aligning labels
 * and values in columns lets someone scan for one field instead of reading
 * top to bottom. Full-width rows are available for long prose (a biography)
 * and for anything that renders its own layout (chips, lists).
 */
import { ReactNode } from 'react';

export interface DetailGridItem {
  label: string;
  value: ReactNode;
  /** Span both columns — for prose or a self-laying-out value. */
  isWide?: boolean;
}

export interface DetailGridProps {
  items: DetailGridItem[];
  /** Optional section heading above the grid. */
  title?: string;
  className?: string;
}

const DetailGrid = ({ items, title, className }: DetailGridProps) => (
  <section className={className}>
    {title && <h3 className="rwaq-detail-grid__title">{title}</h3>}
    <dl className="rwaq-detail-grid">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rwaq-detail-grid__row${item.isWide ? ' rwaq-detail-grid__row--wide' : ''}`}
        >
          <dt className="rwaq-detail-grid__label">{item.label}</dt>
          <dd className="rwaq-detail-grid__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  </section>
);

export default DetailGrid;
