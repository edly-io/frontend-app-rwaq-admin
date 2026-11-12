/**
 * Sizing of the rotated category labels under a chart's x-axis. Kept apart from MetricChart so cards can use
 * it while tests stub the chart.
 */

/** Rotation of category labels, and a safe width in px of one 11px character. */
export const CATEGORY_LABEL_ANGLE = 55;
const CATEGORY_CHAR_PX = 5.8;
const CATEGORY_LABEL_MIN_HEIGHT = 48;
const CATEGORY_LABEL_MAX_HEIGHT = 120;

/** Characters of a category name kept on the x-axis before the "…", English and Arabic. */
export const CATEGORY_LABEL_LIMIT = 22;
export const CATEGORY_LABEL_LIMIT_RTL = 18;

export const categoryLabel = (label: string, rtl: boolean, limit = rtl ? 14 : 18): string => {
  const count = label.match(/ \(\d+\)$/)?.[0] ?? '';
  const name = count ? label.slice(0, -count.length) : label;
  const space = limit - count.length;
  return Array.from(name).length > space
    ? `${Array.from(name).slice(0, space - 1).join('').trimEnd()}…${count}`
    : label;
};

/**
 * Height in px the rotated category labels need under the axis: the longest shown label, cut the way
 * `CategoryTick` cuts it, times the character width and the sine of the rotation, plus the text height.
 */
export const categoryLabelAreaHeight = (names: string[], rtl: boolean): number => {
  const limit = rtl ? CATEGORY_LABEL_LIMIT_RTL : CATEGORY_LABEL_LIMIT;
  const longest = Math.max(0, ...names.map((name) => Array.from(categoryLabel(name, rtl, limit)).length));
  const needed = Math.ceil(longest * CATEGORY_CHAR_PX * Math.sin((CATEGORY_LABEL_ANGLE * Math.PI) / 180)) + 14;
  return Math.min(CATEGORY_LABEL_MAX_HEIGHT, Math.max(CATEGORY_LABEL_MIN_HEIGHT, needed));
};
