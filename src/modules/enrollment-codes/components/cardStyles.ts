/**
 * The card's CSS, copied from the approved mock. One string, used on screen and in the downloaded HTML,
 * so the two cannot drift. Layout is a container query on the card's own width: it stacks under 720px.
 */
export const CARD_CSS = `
/* Scoped to the card: this string is also injected into the admin page. */
.coupon-wrap,.coupon-wrap *,.coupon-wrap *::before,.coupon-wrap *::after{box-sizing:border-box}
.coupon-wrap{width:100%;max-width:840px;container-type:inline-size;font-family:'Cairo','Segoe UI',Tahoma,sans-serif}
.coupon-card{display:flex;width:100%;border-radius:22px;overflow:hidden;background:linear-gradient(135deg,#131f3c 0%,#1a2c55 55%,#2a4785 100%);color:#fff;text-align:left}
.coupon-card__main{flex:1;display:flex;flex-direction:column;gap:20px;padding:30px 36px 24px;min-width:0}
.coupon-card__header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
.coupon-card__logo-tile{background:#fff;border-radius:12px;padding:6px 14px;display:flex;align-items:center}
.coupon-card__logo{height:40px;width:auto;display:block}
.coupon-card__badge{padding:6px 20px;border:1px solid rgba(255,255,255,.45);border-radius:999px;font-size:13px;font-weight:700;letter-spacing:1.5px;color:#ffffffe6;white-space:nowrap}
.coupon-card__code-block{display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px 24px;border:2px dashed rgba(255,255,255,.45);border-radius:14px;background-color:#ffffff0f}
.coupon-card__code-label{font-size:14px;letter-spacing:1px;color:#ffffffbf;white-space:nowrap}
.coupon-card__code{font-size:48px;font-weight:800;letter-spacing:12px;text-transform:uppercase;color:#fff;line-height:1.15;text-indent:12px;max-width:100%;text-align:center;white-space:nowrap}
.coupon-card__quiz{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0}
.coupon-card__quiz-title{font-size:20px;font-weight:700;color:#fff;max-width:100%;line-height:1.5;text-align:center;overflow-wrap:anywhere}
.coupon-card__identity{margin-top:auto;display:flex;flex-direction:column;align-items:center;gap:6px;padding-top:16px;border-top:1px solid rgba(255,255,255,.18);text-align:center}
.coupon-card__slogan{font-size:17px;font-weight:700;color:#5accff;max-width:100%;overflow-wrap:anywhere}
.coupon-card__about{font-size:13px;color:#ffffffbf;max-width:100%;overflow-wrap:anywhere;line-height:1.6}
.coupon-card__contacts{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 18px;margin-top:8px}
.coupon-card__contact{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:#ffffffd9;max-width:100%;overflow-wrap:anywhere}
.coupon-card__contact svg{font-size:14px;color:#5accff;width:1em;height:1em}
.coupon-card__divider{width:0;border-left:2px dashed rgba(255,255,255,.35);margin:24px 0}
.coupon-card__stub{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:30px}
.coupon-card__qr{padding:14px;background-color:#fff;border-radius:16px;display:flex;align-items:center;justify-content:center}
.coupon-card__qr img,.coupon-card__qr svg{display:block;width:170px;height:170px}
.coupon-card__scan-hint{font-size:15px;line-height:1.6;text-align:center;font-weight:600;color:#ffffffe6}

@container (max-width: 720px){
.coupon-card{flex-direction:column;border-radius:18px}
.coupon-card__main{gap:16px;padding:22px 18px 18px}
.coupon-card__header{justify-content:center}
.coupon-card__logo{height:34px}
.coupon-card__badge{padding:5px 14px;font-size:12px;letter-spacing:1px}
.coupon-card__code-block{padding:16px 12px}
.coupon-card__code{font-size:clamp(28px,9cqw,48px);letter-spacing:clamp(4px,2.2cqw,12px);text-indent:clamp(4px,2.2cqw,12px)}
.coupon-card__code-label{white-space:normal;text-align:center}
.coupon-card__divider{width:auto;border-left:0;border-top:2px dashed rgba(255,255,255,.35);margin:0 18px}
.coupon-card__stub{gap:12px;padding:20px 18px 24px}
.coupon-card__scan-hint{font-size:14px}
}
@container (max-width: 380px){
.coupon-card__main{padding:18px 14px 16px}
.coupon-card__contacts{gap:6px 12px}
}
`;

/** The width the downloaded image and file are drawn at, whatever size the card has on screen. */
export const EXPORT_WIDTH = 840;
