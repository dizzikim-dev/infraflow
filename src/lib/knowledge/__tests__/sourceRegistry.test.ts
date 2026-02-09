import { describe, it, expect } from 'vitest';
import {
  ALL_SOURCES,
  isOfficialSource,
  isUserSource,
  withSection,
  NIST_800_41,
  NIST_800_53,
  RFC_7230,
  RFC_8446,
  CIS_V8,
  OWASP_TOP10,
  AWS_WAF_REL,
  SANS_CIS_TOP20,
} from '../sourceRegistry';
import { BASE_CONFIDENCE } from '../types';

describe('sourceRegistry', () => {
  describe('ALL_SOURCES', () => {
    it('should contain at least 25 sources', () => {
      expect(ALL_SOURCES.length).toBeGreaterThanOrEqual(25);
    });

    it('should have unique titles across all sources', () => {
      const titles = ALL_SOURCES.map((s) => s.title);
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(titles.length);
    });

    it('should have accessedDate on all sources', () => {
      for (const source of ALL_SOURCES) {
        expect(source.accessedDate).toBeTruthy();
      }
    });

    it('should have a type on all sources', () => {
      for (const source of ALL_SOURCES) {
        expect(source.type).toBeTruthy();
        expect(BASE_CONFIDENCE[source.type]).toBeDefined();
      }
    });
  });

  describe('NIST sources', () => {
    it('should have correct type', () => {
      expect(NIST_800_41.type).toBe('nist');
      expect(NIST_800_53.type).toBe('nist');
    });

    it('should include NIST in title', () => {
      expect(NIST_800_41.title).toContain('NIST');
      expect(NIST_800_53.title).toContain('NIST');
    });

    it('should have valid URLs', () => {
      expect(NIST_800_41.url).toContain('csrc.nist.gov');
      expect(NIST_800_53.url).toContain('csrc.nist.gov');
    });
  });

  describe('RFC sources', () => {
    it('should have correct type', () => {
      expect(RFC_7230.type).toBe('rfc');
      expect(RFC_8446.type).toBe('rfc');
    });

    it('should include RFC number in title', () => {
      expect(RFC_7230.title).toContain('7230');
      expect(RFC_8446.title).toContain('8446');
    });

    it('should have datatracker URLs', () => {
      expect(RFC_7230.url).toContain('datatracker.ietf.org');
    });
  });

  describe('CIS sources', () => {
    it('should have correct type', () => {
      expect(CIS_V8.type).toBe('cis');
    });
  });

  describe('OWASP sources', () => {
    it('should have correct type', () => {
      expect(OWASP_TOP10.type).toBe('owasp');
    });
  });

  describe('Vendor sources', () => {
    it('should have correct type', () => {
      expect(AWS_WAF_REL.type).toBe('vendor');
    });
  });

  describe('Industry sources', () => {
    it('should have correct type', () => {
      expect(SANS_CIS_TOP20.type).toBe('industry');
    });
  });

  describe('isOfficialSource', () => {
    it('should return true for rfc, nist, cis, owasp', () => {
      expect(isOfficialSource('rfc')).toBe(true);
      expect(isOfficialSource('nist')).toBe(true);
      expect(isOfficialSource('cis')).toBe(true);
      expect(isOfficialSource('owasp')).toBe(true);
    });

    it('should return false for vendor and industry', () => {
      expect(isOfficialSource('vendor')).toBe(false);
      expect(isOfficialSource('industry')).toBe(false);
    });

    it('should return false for user sources', () => {
      expect(isOfficialSource('user_verified')).toBe(false);
      expect(isOfficialSource('user_unverified')).toBe(false);
    });
  });

  describe('isUserSource', () => {
    it('should return true for user types', () => {
      expect(isUserSource('user_verified')).toBe(true);
      expect(isUserSource('user_unverified')).toBe(true);
    });

    it('should return false for non-user types', () => {
      expect(isUserSource('rfc')).toBe(false);
      expect(isUserSource('vendor')).toBe(false);
    });
  });

  describe('withSection', () => {
    it('should override section on source', () => {
      const modified = withSection(NIST_800_41, 'Section 5.1');
      expect(modified.section).toBe('Section 5.1');
      expect(modified.title).toBe(NIST_800_41.title);
      expect(modified.type).toBe(NIST_800_41.type);
    });

    it('should not mutate the original source', () => {
      const originalSection = NIST_800_41.section;
      withSection(NIST_800_41, 'New Section');
      expect(NIST_800_41.section).toBe(originalSection);
    });
  });

  describe('BASE_CONFIDENCE', () => {
    it('should have highest confidence for rfc', () => {
      expect(BASE_CONFIDENCE.rfc).toBe(1.0);
    });

    it('should have descending confidence by source authority', () => {
      expect(BASE_CONFIDENCE.rfc).toBeGreaterThan(BASE_CONFIDENCE.nist);
      expect(BASE_CONFIDENCE.nist).toBeGreaterThanOrEqual(BASE_CONFIDENCE.cis);
      expect(BASE_CONFIDENCE.owasp).toBeGreaterThan(BASE_CONFIDENCE.vendor);
      expect(BASE_CONFIDENCE.vendor).toBeGreaterThan(BASE_CONFIDENCE.industry);
      expect(BASE_CONFIDENCE.industry).toBeGreaterThan(BASE_CONFIDENCE.user_verified);
      expect(BASE_CONFIDENCE.user_verified).toBeGreaterThan(BASE_CONFIDENCE.user_unverified);
    });

    it('should have lowest confidence for user_unverified', () => {
      expect(BASE_CONFIDENCE.user_unverified).toBe(0.3);
    });
  });
});
