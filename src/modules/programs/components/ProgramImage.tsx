/**
 * Program thumbnail with a graceful fallback chain:
 *   1. card_image (the program's own uploaded image)
 *   2. organizationLogo (the partner org's branding)
 *   3. Paragon Avatar placeholder (no src → Avatar renders its built-in icon)
 *
 * Sized to match ProfileAvatar in other tables (size="sm" = 32×32).
 */
import { useEffect, useState } from 'react';
import { Avatar } from '@openedx/paragon';

export interface ProgramImageProps {
  cardImage: string | null;
  organizationLogo: string | null;
  programName: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const ProgramImage = ({
  cardImage,
  organizationLogo,
  programName,
  size = 'sm',
  className,
}: ProgramImageProps) => {
  // Build the ordered list of candidate URLs (skip nulls/empty).
  const sources = [cardImage, organizationLogo].filter(Boolean) as string[];

  const [step, setStep] = useState(0);

  // A new row resets to the first candidate.
  useEffect(() => setStep(0), [cardImage, organizationLogo]);

  const currentSrc = step < sources.length ? sources[step] : undefined;

  const handleError = () => {
    // Step to the next candidate; if exhausted, Avatar renders its own placeholder.
    setStep((prev) => prev + 1);
  };

  return (
    <Avatar
      src={currentSrc}
      alt={programName}
      size={size}
      className={className}
      onError={handleError}
    />
  );
};

export default ProgramImage;
