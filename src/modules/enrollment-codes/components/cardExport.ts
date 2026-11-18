/**
 * Turns the card into a PNG or a standalone HTML file.
 *
 * Both are made from the share modal's off-screen copy of the card, which is drawn at EXPORT_WIDTH, so a
 * narrow modal never changes what is downloaded. The card's logo and QR code are already data URLs, so
 * nothing is fetched from another site and nothing can taint the image.
 */
import { getFontEmbedCSS, toBlob } from 'html-to-image';
import { CARD_CSS, EXPORT_WIDTH } from './cardStyles';

/** Waits until the card's fonts are loaded, so the file is not drawn in a fallback font. */
export const waitForFonts = async () => {
  try {
    await document.fonts?.ready;
  } catch {
    // A browser without the Font Loading API draws with whatever it has.
  }
};

/** Only the Cairo @font-face rules, as data URLs, so the file does not carry every font the admin page loads. */
const cairoFontCss = async (node: HTMLElement): Promise<string> => {
  try {
    const css = await getFontEmbedCSS(node);
    return css.split('@font-face').filter((rule) => /Cairo/i.test(rule)).map((rule) => `@font-face${rule}`).join('\n');
  } catch {
    return '';
  }
};

/** The card as a PNG at twice its 840px size. */
export const cardToPng = async (node: HTMLElement): Promise<Blob> => {
  await waitForFonts();
  const blob = await toBlob(node, {
    pixelRatio: 2,
    width: EXPORT_WIDTH,
    height: node.offsetHeight,
    fontEmbedCSS: await cairoFontCss(node),
    style: { width: `${EXPORT_WIDTH}px`, maxWidth: `${EXPORT_WIDTH}px` },
  });
  if (!blob) { throw new Error('The card could not be drawn.'); }
  return blob;
};

const svgToDataUrl = (svg: Element): string => {
  const xml = new XMLSerializer().serializeToString(svg);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(xml)))}`;
};

/** A file that opens by itself: inline CSS and fonts, the logo and the QR code as data URLs. */
export const cardToHtml = async (node: HTMLElement, code: string): Promise<Blob> => {
  await waitForFonts();
  const fontCss = await cairoFontCss(node);
  const clone = node.cloneNode(true) as HTMLElement;
  clone.removeAttribute('data-testid');
  clone.querySelectorAll('svg[data-qr]').forEach((svg) => {
    const img = document.createElement('img');
    img.alt = 'QR code';
    img.src = svgToDataUrl(svg);
    svg.replaceWith(img);
  });
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Enrollment code ${code}</title>
<style>
${fontCss}
${CARD_CSS}
body{margin:0;padding:24px;background:#eef1f7;display:flex;justify-content:center}
</style></head><body>${clone.outerHTML}</body></html>`;
  return new Blob([html], { type: 'text/html;charset=utf-8' });
};
