/**
 * The share card: the fixed bilingual texts, the Arabic parts marked right-to-left, only the platform
 * settings that are set, and very long Arabic names and about lines. The layout itself is CSS
 * (a container query), so what is checked here is the markup the CSS works on.
 */
import { render, screen } from '@testing-library/react';
import type { CodeCard } from '../data/types';
import { CARD_CSS, EXPORT_WIDTH } from './cardStyles';
import EnrollmentCodeCard from './EnrollmentCodeCard';

const baseCard: CodeCard = {
  code: 'V4WPTB',
  itemName: 'أساسيات السلامة',
  itemKind: 'course',
  organizationName: 'Rwaq',
  organizationArabicName: 'رواق',
  logo: 'data:image/png;base64,iVBORw0KGgo=',
  qrUrl: 'https://rwaq.org/enroll?code=V4WPTB',
  expiresAt: null,
  platform: {
    slogan: 'رواق .. المنصة العربية للتعليم المفتوح',
    about: 'إحدى مبادرات جمعية أروقة المعرفة',
    links: [
      { type: 'website', url: 'https://rwaq.org', text: 'rwaq.org' },
      { type: 'x', url: 'https://x.com/rwaq', text: 'rwaq' },
      { type: 'linkedin', url: 'https://linkedin.com/company/RwaqOrg', text: 'RwaqOrg' },
      { type: 'instagram', url: 'https://instagram.com/rwaq_', text: 'rwaq_' },
      { type: 'youtube', url: 'https://youtube.com/@rwaqorg', text: 'rwaqorg' },
    ],
  },
};

const LONG_ARABIC_NAME = `مقدمة شاملة في أساسيات السلامة والصحة المهنية في بيئات العمل الصناعية والإنشائية ${
  'وإدارة المخاطر وخطط الطوارئ والإخلاء للعاملين والمشرفين '.repeat(3)}`;
const LONG_ABOUT = `إحدى مبادرات جمعية أروقة المعرفة المتخصصة في دعم التعليم المفتوح ونشر المعرفة باللغة العربية ${
  'لجميع المتعلمين في العالم العربي وخارجه '.repeat(4)}`;

describe('EnrollmentCodeCard', () => {
  it('shows the fixed bilingual texts and the code', () => {
    const { container } = render(<EnrollmentCodeCard card={baseCard} />);
    expect(screen.getByText('V4WPTB')).toBeInTheDocument();
    expect(container.querySelector('.coupon-card__badge')).toHaveTextContent('ENROLLMENT CODE · رمز التسجيل');
    expect(container.querySelector('.coupon-card__code-label')).toHaveTextContent('الرمز · CODE');
    expect(container.querySelector('.coupon-card__quiz-title')).toHaveTextContent('صالح للتسجيل في: أساسيات السلامة');
    expect(container.querySelector('.coupon-card__scan-hint')).toHaveTextContent('امسح الرمز للبدء');
    expect(container.querySelector('.coupon-card__scan-hint')).toHaveTextContent('Scan to start');
  });

  it('marks the Arabic parts right-to-left and Arabic', () => {
    const { container } = render(<EnrollmentCodeCard card={baseCard} />);
    expect(container.querySelector('.coupon-card')).toHaveAttribute('dir', 'ltr');
    ['.coupon-card__quiz-title', '.coupon-card__identity'].forEach((selector) => {
      const node = container.querySelector(selector);
      expect(node).toHaveAttribute('dir', 'rtl');
      expect(node).toHaveAttribute('lang', 'ar');
    });
    const arabicSpans = Array.from(container.querySelectorAll('span[lang="ar"][dir="rtl"]')).map((n) => n.textContent);
    expect(arabicSpans).toEqual(expect.arrayContaining(['رمز التسجيل', 'الرمز', 'امسح الرمز للبدء']));
  });

  it('shows the logo on its white tile and the QR code', () => {
    const { container } = render(<EnrollmentCodeCard card={baseCard} />);
    const logo = container.querySelector('.coupon-card__logo-tile img');
    expect(logo).toHaveAttribute('src', baseCard.logo);
    expect(container.querySelector('.coupon-card__qr svg[data-qr]')).toBeInTheDocument();
  });

  it('shows the slogan, the about line and every link with its text', () => {
    const { container } = render(<EnrollmentCodeCard card={baseCard} />);
    expect(screen.getByText('رواق .. المنصة العربية للتعليم المفتوح')).toBeInTheDocument();
    expect(screen.getByText('إحدى مبادرات جمعية أروقة المعرفة')).toBeInTheDocument();
    const links = Array.from(container.querySelectorAll('.coupon-card__contact')).map((n) => n.textContent?.trim());
    expect(links).toEqual(['rwaq.org', 'rwaq', 'RwaqOrg', 'rwaq_', 'rwaqorg']);
    expect(container.querySelectorAll('.coupon-card__contact svg')).toHaveLength(5);
  });

  it('shows only the platform settings that are set', () => {
    const { container } = render(
      <EnrollmentCodeCard card={{ ...baseCard, logo: '', platform: { slogan: 'Only a slogan', about: '', links: [] } }} />,
    );
    expect(screen.getByText('Only a slogan')).toBeInTheDocument();
    expect(container.querySelector('.coupon-card__about')).not.toBeInTheDocument();
    expect(container.querySelector('.coupon-card__contacts')).not.toBeInTheDocument();
    expect(container.querySelector('.coupon-card__logo-tile')).not.toBeInTheDocument();
  });

  it('leaves the identity block out when the platform set nothing, and skips a link with no text', () => {
    const { container } = render(
      <EnrollmentCodeCard
        card={{
          ...baseCard,
          platform: { slogan: '', about: '', links: [{ type: 'email', url: 'mailto:a@b.c', text: '' }] },
        }}
      />,
    );
    expect(container.querySelector('.coupon-card__identity')).not.toBeInTheDocument();
  });

  it('keeps a very long Arabic item name and a very long about line in the markup the CSS wraps', () => {
    const { container } = render(
      <EnrollmentCodeCard
        card={{ ...baseCard, itemName: LONG_ARABIC_NAME, platform: { ...baseCard.platform, about: LONG_ABOUT } }}
      />,
    );
    expect(container.querySelector('.coupon-card__quiz-title')).toHaveTextContent(LONG_ARABIC_NAME.trim());
    expect(container.querySelector('.coupon-card__about')).toHaveTextContent(LONG_ABOUT.trim());
    // The title and the about line may wrap anywhere, and the card stacks under 720px on its own width.
    expect(CARD_CSS).toMatch(/\.coupon-card__quiz-title\{[^}]*overflow-wrap:anywhere/);
    expect(CARD_CSS).toMatch(/\.coupon-card__about\{[^}]*overflow-wrap:anywhere/);
    expect(CARD_CSS).toContain('container-type:inline-size');
    expect(CARD_CSS).toContain('@container (max-width: 720px)');
    expect(EXPORT_WIDTH).toBe(840);
  });

  it('uses the approved colors and sizes', () => {
    expect(CARD_CSS).toContain('linear-gradient(135deg,#131f3c 0%,#1a2c55 55%,#2a4785 100%)');
    expect(CARD_CSS).toContain('.coupon-wrap{width:100%;max-width:840px');
    expect(CARD_CSS).toMatch(/\.coupon-card__qr img,\.coupon-card__qr svg\{[^}]*width:170px;height:170px/);
    expect(CARD_CSS).toMatch(/\.coupon-card__logo-tile\{background:#fff/);
  });
});
