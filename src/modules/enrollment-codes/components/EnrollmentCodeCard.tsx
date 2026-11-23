/**
 * The shareable enrollment code card: the code, what it is valid for, the platform's identity and a QR code.
 *
 * The card is the same for every admin: fixed bilingual headings, the organization's Arabic name when it has one
 * (the line it sits in is Arabic) and the expiry in both languages, whatever the interface language is.
 * Only the platform settings that are set are shown. With no QR link (the public site address is not set) the
 * QR part is left out. The layout is plain CSS (CARD_CSS) with a container query,
 * so it follows the card's own width.
 *
 * The same component is drawn twice by the share modal: on screen at whatever width the modal has, and off
 * screen at EXPORT_WIDTH, which is what the downloads are made from.
 */
import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { localizedName } from '@src/data/localizedName';
import type { CodeCard } from '../data/types';
import { linkIcon } from './cardIcons';
import { formatDate } from './codeDates';

interface EnrollmentCodeCardProps {
  card: CodeCard;
  testId?: string;
}

const EnrollmentCodeCard = forwardRef<HTMLDivElement, EnrollmentCodeCardProps>(({ card, testId }, ref) => {
  const { platform } = card;
  const itemName = card.itemKind === 'organization'
    ? localizedName('ar', card.itemName, card.organizationArabicName?.trim())
    : card.itemName;
  const links = (platform.links ?? []).filter((link) => link.text);
  const hasIdentity = Boolean(platform.slogan || platform.about || links.length);

  return (
    <div className="coupon-wrap" ref={ref} data-testid={testId}>
      <div className="coupon-card" dir="ltr">
        <div className="coupon-card__main">
          <div className="coupon-card__header">
            {card.logo && (
              <div className="coupon-card__logo-tile">
                <img className="coupon-card__logo" alt="" src={card.logo} />
              </div>
            )}
            <span className="coupon-card__badge">
              ENROLLMENT CODE ·
              {' '}
              <span dir="rtl" lang="ar">رمز التسجيل</span>
            </span>
          </div>
          <div className="coupon-card__code-block">
            <span className="coupon-card__code-label">
              <span dir="rtl" lang="ar">الرمز</span>
              {' '}
              · CODE
            </span>
            <span className="coupon-card__code">{card.code}</span>
          </div>
          <div className="coupon-card__quiz">
            <span className="coupon-card__quiz-title" dir="rtl" lang="ar">
              صالح للتسجيل في:
              {' '}
              <bdi>{itemName}</bdi>
            </span>
            {card.expiresAt && (
              <span className="coupon-card__expiry">
                Expires on
                {' '}
                {formatDate(card.expiresAt, 'en')}
                {' · '}
                <span dir="rtl" lang="ar">
                  ينتهي في
                  {' '}
                  {formatDate(card.expiresAt, 'ar')}
                </span>
              </span>
            )}
          </div>
          {hasIdentity && (
            <div className="coupon-card__identity" dir="rtl" lang="ar">
              {platform.slogan && <span className="coupon-card__slogan">{platform.slogan}</span>}
              {platform.about && <span className="coupon-card__about">{platform.about}</span>}
              {links.length > 0 && (
                <div className="coupon-card__contacts" dir="ltr">
                  {links.map((link) => (
                    <span className="coupon-card__contact" key={`${link.type}-${link.url}`}>
                      {linkIcon(link.type)}
                      {' '}
                      {link.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {card.qrUrl && (
          <>
            <div className="coupon-card__divider" />
            <div className="coupon-card__stub">
              <div className="coupon-card__qr">
                <QRCodeSVG
                  value={card.qrUrl}
                  size={512}
                  level="M"
                  marginSize={0}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  data-qr="true"
                  aria-label="QR code"
                  role="img"
                />
              </div>
              <span className="coupon-card__scan-hint">
                <span dir="rtl" lang="ar">امسح الرمز للبدء</span>
                <br />
                Scan to start
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

EnrollmentCodeCard.displayName = 'EnrollmentCodeCard';

export default EnrollmentCodeCard;
