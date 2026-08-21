/**
 * Avatar fallback: the platform's default path 404s, so it must not be used,
 * and a load failure has to fall back too.
 */
import { screen, fireEvent } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import ProfileAvatar from './ProfileAvatar';

describe('ProfileAvatar', () => {
  it('uses a real image URL', () => {
    renderWrapper(<ProfileAvatar src="http://cdn/me.jpg" name="Me" />);
    expect(screen.getByAltText('Me')).toHaveAttribute('src', 'http://cdn/me.jpg');
  });

  it('ignores the platform default-profile path', () => {
    renderWrapper(
      <ProfileAvatar src="http://studio/static/studio/images/profiles/default_50.png" name="Me" />,
    );
    expect(screen.getByAltText('Me')).not.toHaveAttribute('src', expect.stringContaining('default_50'));
  });

  it('falls back when the image fails to load', () => {
    renderWrapper(<ProfileAvatar src="http://cdn/broken.jpg" name="Me" />);
    const image = screen.getByAltText('Me');

    fireEvent.error(image);

    expect(image).not.toHaveAttribute('src', 'http://cdn/broken.jpg');
  });

  it('renders a placeholder when there is no image at all', () => {
    renderWrapper(<ProfileAvatar name="Me" />);
    expect(screen.getByAltText('Me')).toHaveAttribute('src');
  });
});
