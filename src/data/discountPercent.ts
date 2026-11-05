/**
 * Whole-number percent off, computed live from the price inputs (raw strings).
 * Returns null unless both are valid numbers with regular > 0 and 0 < sale < regular.
 */
export const getDiscountPercent = (regularPrice: string, salePrice: string): number | null => {
  if (regularPrice.trim() === '' || salePrice.trim() === '') { return null; }
  const regular = Number(regularPrice);
  const sale = Number(salePrice);
  if (!Number.isFinite(regular) || !Number.isFinite(sale)) { return null; }
  if (!(regular > 0) || !(sale > 0) || !(sale < regular)) { return null; }
  return Math.round(((regular - sale) / regular) * 100);
};

/**
 * The price a learner pays with VAT, in SAR units, from the raw price inputs and the VAT rate in percent.
 * Uses the sale price when it is valid (0 < sale < regular), else the regular price.
 * Returns null when the regular price is empty or not above 0, or the rate is not above 0.
 * Rounds half up to 2 places on whole cents, so no float error creeps into the cents.
 */
export const getPriceWithVat = (
  regularPrice: string,
  salePrice: string,
  vatRate: string | null | undefined,
): number | null => {
  const rate = Number(vatRate);
  if (vatRate == null || vatRate.trim() === '' || !Number.isFinite(rate) || !(rate > 0)) { return null; }
  if (regularPrice.trim() === '') { return null; }
  const regular = Number(regularPrice);
  if (!Number.isFinite(regular) || !(regular > 0)) { return null; }
  const sale = salePrice.trim() === '' ? NaN : Number(salePrice);
  const price = Number.isFinite(sale) && sale > 0 && sale < regular ? sale : regular;
  const cents = Math.round(price * 100);
  const rateBasisPoints = Math.round(rate * 100);
  return Math.floor((cents * (10000 + rateBasisPoints) + 5000) / 10000) / 100;
};

export default getDiscountPercent;
