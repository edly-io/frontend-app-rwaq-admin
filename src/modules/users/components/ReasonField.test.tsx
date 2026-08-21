/**
 * The reason field's resolution rules.
 *
 * These are what stand between a required field and an audit trail full of
 * blanks, and they are pure functions — so they get tested directly rather
 * than through three modals that each call them the same way.
 */
import {
  REASON_OTHER, emptyReason, hasReason, resolveReason,
} from './ReasonField';

describe('resolveReason', () => {
  it('uses the preset when one is chosen', () => {
    expect(resolveReason({ reasonPreset: 'Partner agreement', reasonCustom: '' }))
      .toBe('Partner agreement');
  });

  it('uses the custom text when the preset is the "other" sentinel', () => {
    expect(resolveReason({ reasonPreset: REASON_OTHER, reasonCustom: 'Merged duplicate account' }))
      .toBe('Merged duplicate account');
  });

  it('never returns the sentinel itself as a reason', () => {
    expect(resolveReason({ reasonPreset: REASON_OTHER, reasonCustom: '' }))
      .not.toBe(REASON_OTHER);
  });

  it('trims the custom text, so whitespace is not a reason', () => {
    expect(resolveReason({ reasonPreset: REASON_OTHER, reasonCustom: '  spaces  ' }))
      .toBe('spaces');
  });
});

describe('hasReason', () => {
  it('rejects an untouched field', () => {
    expect(hasReason(emptyReason)).toBe(false);
  });

  it('rejects "other" with nothing written in it', () => {
    expect(hasReason({ reasonPreset: REASON_OTHER, reasonCustom: '' })).toBe(false);
  });

  // The bug this exists to prevent: a required-check on the raw string passes
  // for a field holding only spaces, and the audit row then reads as blank.
  it('rejects "other" containing only whitespace', () => {
    expect(hasReason({ reasonPreset: REASON_OTHER, reasonCustom: '   ' })).toBe(false);
  });

  it('accepts a preset', () => {
    expect(hasReason({ reasonPreset: 'Testing / QA', reasonCustom: '' })).toBe(true);
  });

  it('accepts written-out custom text', () => {
    expect(hasReason({ reasonPreset: REASON_OTHER, reasonCustom: 'Court order' })).toBe(true);
  });
});
