import { ReactNode } from 'react';
import { Container } from '@openedx/paragon';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  /** Primary action slot (e.g. an "Add" button) */
  primaryAction?: ReactNode;
}

const PageHeader = ({ title, breadcrumbs, primaryAction }: PageHeaderProps) => (
  <div
    style={{
      borderBottom: '1px solid var(--pgn-color-gray-200, #dee2e6)',
      background: 'var(--pgn-color-white, #fff)',
      padding: '1rem 0',
    }}
  >
    <Container>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="breadcrumb" className="mb-1">
          <ol
            style={{
              display: 'flex',
              listStyle: 'none',
              padding: 0,
              margin: 0,
              gap: '0.5rem',
              fontSize: '0.8125rem',
              color: 'var(--pgn-color-gray-500, #6B757F)',
            }}
          >
            {breadcrumbs.map((crumb, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {i > 0 && <span aria-hidden="true">/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    style={{ color: 'var(--pgn-color-primary-500, #0070D2)', textDecoration: 'none' }}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}>
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="d-flex align-items-center justify-content-between">
        <h1
          className="mb-0"
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--pgn-color-gray-700, #273F58)',
          }}
        >
          {title}
        </h1>
        {primaryAction && <div>{primaryAction}</div>}
      </div>
    </Container>
  </div>
);

export default PageHeader;
