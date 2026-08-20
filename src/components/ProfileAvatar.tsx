/**
 * Avatar with a real fallback.
 *
 * Two things can go wrong with a platform profile image, and both end up as a
 * broken-image icon in the table:
 *   - the API returns the platform's *default* avatar path, which 404s in this
 *     deployment, so a URL being present doesn't mean an image exists;
 *   - any other URL can fail to load at request time.
 *
 * So known-default paths are dropped up front, and a load error swaps in
 * Paragon's built-in placeholder (Avatar renders it whenever src is empty).
 */
import { useEffect, useState } from 'react';
import { Avatar } from '@openedx/paragon';

/** Platform default-profile-image paths — present but not actually served. */
const DEFAULT_IMAGE_PATTERN = /\/images\/profiles\/default_/;

const isUsable = (src?: string | null) => !!src && !DEFAULT_IMAGE_PATTERN.test(src);

export interface ProfileAvatarProps {
  src?: string | null;
  /** Used for the accessible name; the image itself is decorative next to a visible name. */
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
}

const ProfileAvatar = ({
  src, name = '', size = 'sm', className,
}: ProfileAvatarProps) => {
  const [hasFailed, setHasFailed] = useState(false);

  // A new src deserves a fresh attempt — otherwise a recycled row keeps the
  // previous row's failure.
  useEffect(() => setHasFailed(false), [src]);

  const resolvedSrc = !hasFailed && isUsable(src) ? (src as string) : undefined;

  return (
    <Avatar
      src={resolvedSrc}
      alt={name}
      size={size}
      className={className}
      onError={() => setHasFailed(true)}
    />
  );
};

export default ProfileAvatar;
