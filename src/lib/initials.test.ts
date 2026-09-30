import { describe, expect, it } from 'vitest';

import { getInitials } from './initials';

describe('getInitials', () => {
    it('takes the first + last initial of a multi-word name', () => {
        expect(getInitials('Amira Haddad')).toBe('AH');
    });

    it('uses the FIRST and LAST word for 3+ word names', () => {
        expect(getInitials('Mary Jane Watson')).toBe('MW');
    });

    it('returns a single initial for a one-word name', () => {
        expect(getInitials('Cher')).toBe('C');
    });

    it('upper-cases lowercase input', () => {
        expect(getInitials('amira haddad')).toBe('AH');
    });

    it('collapses extra whitespace', () => {
        expect(getInitials('  Amira   Haddad  ')).toBe('AH');
    });

    it('falls back to ? for an empty or whitespace-only name', () => {
        expect(getInitials('')).toBe('?');
        expect(getInitials('   ')).toBe('?');
    });
});
