/**
 * Chip overflow: the first entries stay visible, the rest collapse to "+N".
 */
import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import ChipOverflowList from './ChipOverflowList';

const items = [
  { key: 'a', label: 'Superuser' },
  { key: 'b', label: 'Global Staff' },
  { key: 'c', label: 'Course Creator' },
];

describe('ChipOverflowList', () => {
  it('shows an empty placeholder when there is nothing', () => {
    renderWrapper(<ChipOverflowList id="t" items={[]} emptyLabel="none" />);
    expect(screen.getByText('none')).toBeInTheDocument();
  });

  it('shows one chip plus a count for the rest', () => {
    renderWrapper(<ChipOverflowList id="t" items={items} />);

    expect(screen.getByText('Superuser')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.queryByText('Global Staff')).not.toBeInTheDocument();
  });

  it('does not collapse when everything fits', () => {
    renderWrapper(<ChipOverflowList id="t" items={items} maxVisible={99} />);

    expect(screen.getByText('Course Creator')).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('keeps the hidden entries reachable by keyboard and screen reader', () => {
    renderWrapper(<ChipOverflowList id="t" items={items} />);

    const overflow = screen.getByRole('button', { name: 'Global Staff, Course Creator' });
    expect(overflow).toHaveAttribute('tabindex', '0');
  });
});
