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

export default getDiscountPercent;
