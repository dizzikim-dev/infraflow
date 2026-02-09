import { describe, it, expect } from 'vitest';
import type { InfraNodeType } from '@/types/infra';
import {
  INDUSTRY_PRESETS,
  getPreset,
  getRequiredComponents,
  checkCompliance,
  getIndustryAntiPatterns,
} from '../industryPresets';
import type {
  IndustryType,
  IndustryPreset,
  ComplianceRule,
} from '../industryPresets';

// ---------------------------------------------------------------------------
// All industry types for iteration
// ---------------------------------------------------------------------------

const ALL_INDUSTRIES: IndustryType[] = [
  'financial',
  'healthcare',
  'government',
  'ecommerce',
];

// ---------------------------------------------------------------------------
// Registry validation
// ---------------------------------------------------------------------------

describe('industryPresets', () => {
  describe('INDUSTRY_PRESETS registry', () => {
    it('should have all 4 industry presets', () => {
      expect(Object.keys(INDUSTRY_PRESETS)).toHaveLength(4);
      for (const industry of ALL_INDUSTRIES) {
        expect(INDUSTRY_PRESETS[industry]).toBeDefined();
      }
    });

    it('each preset should have nameKo and descriptionKo', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = INDUSTRY_PRESETS[industry];
        expect(preset.nameKo).toBeTruthy();
        expect(preset.descriptionKo).toBeTruthy();
        expect(typeof preset.nameKo).toBe('string');
        expect(typeof preset.descriptionKo).toBe('string');
      }
    });

    it('each preset should have at least 1 compliance framework', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = INDUSTRY_PRESETS[industry];
        expect(preset.compliance.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('each preset should have required components', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = INDUSTRY_PRESETS[industry];
        expect(preset.requiredComponents.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('each compliance rule should have id and severity', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = INDUSTRY_PRESETS[industry];
        for (const compliance of preset.compliance) {
          for (const rule of compliance.requirements) {
            expect(rule.id).toBeTruthy();
            expect(['critical', 'high', 'medium']).toContain(rule.severity);
          }
        }
      }
    });

    it('each compliance rule should have descriptionKo and requiredComponents', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = INDUSTRY_PRESETS[industry];
        for (const compliance of preset.compliance) {
          for (const rule of compliance.requirements) {
            expect(rule.descriptionKo).toBeTruthy();
            expect(rule.requiredComponents.length).toBeGreaterThanOrEqual(1);
          }
        }
      }
    });

    it('each antipattern should have id and nameKo', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = INDUSTRY_PRESETS[industry];
        for (const ap of preset.industryAntiPatterns) {
          expect(ap.id).toBeTruthy();
          expect(ap.nameKo).toBeTruthy();
        }
      }
    });

    it('each antipattern should have severityKo and detectionHintKo', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = INDUSTRY_PRESETS[industry];
        for (const ap of preset.industryAntiPatterns) {
          expect(ap.severityKo).toBeTruthy();
          expect(ap.detectionHintKo).toBeTruthy();
        }
      }
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(INDUSTRY_PRESETS)).toBe(true);
    });

    it('each compliance framework should have frameworkKo and version', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = INDUSTRY_PRESETS[industry];
        for (const compliance of preset.compliance) {
          expect(compliance.framework).toBeTruthy();
          expect(compliance.frameworkKo).toBeTruthy();
          expect(compliance.version).toBeTruthy();
        }
      }
    });

    it('each preset id should match its key in the record', () => {
      for (const industry of ALL_INDUSTRIES) {
        expect(INDUSTRY_PRESETS[industry].id).toBe(industry);
      }
    });

    it('each preset should have recommended components', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = INDUSTRY_PRESETS[industry];
        expect(preset.recommendedComponents.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('each preset should have additional relationships', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = INDUSTRY_PRESETS[industry];
        expect(preset.additionalRelationships.length).toBeGreaterThanOrEqual(5);
      }
    });

    it('each relationship should have valid relationship type', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = INDUSTRY_PRESETS[industry];
        for (const rel of preset.additionalRelationships) {
          expect(['requires', 'recommends', 'conflicts']).toContain(
            rel.relationshipType,
          );
          expect(rel.source).toBeTruthy();
          expect(rel.target).toBeTruthy();
          expect(rel.reasonKo).toBeTruthy();
        }
      }
    });
  });

  // ---------------------------------------------------------------------------
  // getPreset
  // ---------------------------------------------------------------------------

  describe('getPreset', () => {
    it('should return preset for each industry type', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = getPreset(industry);
        expect(preset).toBeDefined();
        expect(preset.id).toBe(industry);
      }
    });

    it('should have compliance requirements', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = getPreset(industry);
        expect(preset.compliance.length).toBeGreaterThanOrEqual(1);
        for (const c of preset.compliance) {
          expect(c.requirements.length).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it('should have best practices (5+)', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = getPreset(industry);
        expect(preset.bestPracticesKo.length).toBeGreaterThanOrEqual(5);
      }
    });

    it('should return the same reference as INDUSTRY_PRESETS', () => {
      for (const industry of ALL_INDUSTRIES) {
        expect(getPreset(industry)).toBe(INDUSTRY_PRESETS[industry]);
      }
    });

    it('financial preset should have PCI-DSS framework', () => {
      const preset = getPreset('financial');
      const frameworks = preset.compliance.map((c) => c.framework);
      expect(frameworks).toContain('PCI-DSS');
    });

    it('healthcare preset should have HIPAA framework', () => {
      const preset = getPreset('healthcare');
      const frameworks = preset.compliance.map((c) => c.framework);
      expect(frameworks).toContain('HIPAA');
    });

    it('government preset should have FISMA/NIST framework', () => {
      const preset = getPreset('government');
      const frameworks = preset.compliance.map((c) => c.framework);
      expect(frameworks.some((f) => f.includes('NIST') || f.includes('FISMA'))).toBe(true);
    });

    it('ecommerce preset should have PCI-DSS and e-commerce law frameworks', () => {
      const preset = getPreset('ecommerce');
      const frameworks = preset.compliance.map((c) => c.framework);
      expect(frameworks).toContain('PCI-DSS');
      expect(frameworks.some((f) => f.includes('ECOMMERCE') || f.includes('ECL'))).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // getRequiredComponents
  // ---------------------------------------------------------------------------

  describe('getRequiredComponents', () => {
    it('financial should require firewall, waf, mfa', () => {
      const components = getRequiredComponents('financial');
      expect(components).toContain('firewall');
      expect(components).toContain('waf');
      expect(components).toContain('mfa');
    });

    it('healthcare should require vpn-gateway, mfa', () => {
      const components = getRequiredComponents('healthcare');
      expect(components).toContain('vpn-gateway');
      expect(components).toContain('mfa');
    });

    it('government should require ids-ips, nac', () => {
      const components = getRequiredComponents('government');
      expect(components).toContain('ids-ips');
      expect(components).toContain('nac');
    });

    it('ecommerce should require cdn, load-balancer', () => {
      const components = getRequiredComponents('ecommerce');
      expect(components).toContain('cdn');
      expect(components).toContain('load-balancer');
    });

    it('financial should require ids-ips and dlp', () => {
      const components = getRequiredComponents('financial');
      expect(components).toContain('ids-ips');
      expect(components).toContain('dlp');
    });

    it('government should require firewall, waf, vpn-gateway, ldap-ad, mfa, iam', () => {
      const components = getRequiredComponents('government');
      expect(components).toContain('firewall');
      expect(components).toContain('waf');
      expect(components).toContain('vpn-gateway');
      expect(components).toContain('ldap-ad');
      expect(components).toContain('mfa');
      expect(components).toContain('iam');
    });

    it('ecommerce should require cache, db-server, backup', () => {
      const components = getRequiredComponents('ecommerce');
      expect(components).toContain('cache');
      expect(components).toContain('db-server');
      expect(components).toContain('backup');
    });
  });

  // ---------------------------------------------------------------------------
  // checkCompliance
  // ---------------------------------------------------------------------------

  describe('checkCompliance', () => {
    it('should pass when all required components present (financial)', () => {
      const allComponents: InfraNodeType[] = [
        'firewall', 'waf', 'ids-ips', 'dlp', 'db-server',
        'backup', 'mfa', 'iam', 'nac',
      ];
      const result = checkCompliance('financial', allComponents);
      expect(result.failed).toHaveLength(0);
      expect(result.passed.length).toBeGreaterThan(0);
    });

    it('should fail when missing required component', () => {
      // Financial without firewall - PCI-1.1 requires firewall
      const components: InfraNodeType[] = ['waf', 'ids-ips', 'dlp', 'db-server'];
      const result = checkCompliance('financial', components);
      expect(result.failed.length).toBeGreaterThan(0);
    });

    it('should return specific failed rules', () => {
      // Missing firewall for financial
      const components: InfraNodeType[] = ['waf', 'mfa', 'iam', 'db-server', 'dlp', 'ids-ips'];
      const result = checkCompliance('financial', components);
      const failedIds = result.failed.map((r) => r.id);
      // PCI-1.1 requires firewall, so it should fail
      expect(failedIds).toContain('PCI-1.1');
    });

    it('should handle empty component list', () => {
      const result = checkCompliance('financial', []);
      expect(result.failed.length).toBeGreaterThan(0);
      expect(result.passed).toHaveLength(0);
    });

    it('should pass healthcare compliance with all required components', () => {
      const allComponents: InfraNodeType[] = [
        'firewall', 'vpn-gateway', 'db-server', 'backup',
        'ldap-ad', 'mfa', 'iam', 'ids-ips', 'dlp', 'sso',
      ];
      const result = checkCompliance('healthcare', allComponents);
      expect(result.failed).toHaveLength(0);
    });

    it('should fail healthcare compliance when missing vpn-gateway', () => {
      const components: InfraNodeType[] = [
        'firewall', 'db-server', 'backup', 'ldap-ad', 'mfa',
      ];
      const result = checkCompliance('healthcare', components);
      const failedIds = result.failed.map((r) => r.id);
      expect(failedIds).toContain('HIPAA-164.312(e)');
    });

    it('should categorize rules correctly between passed and failed', () => {
      // Provide only firewall - some rules pass, some fail
      const components: InfraNodeType[] = ['firewall'];
      const result = checkCompliance('ecommerce', components);
      // PCI-EC-1.1 only requires firewall, should pass
      const passedIds = result.passed.map((r) => r.id);
      expect(passedIds).toContain('PCI-EC-1.1');
      // PCI-EC-6.6 requires waf, should fail
      const failedIds = result.failed.map((r) => r.id);
      expect(failedIds).toContain('PCI-EC-6.6');
    });

    it('should count total rules correctly', () => {
      const result = checkCompliance('financial', []);
      const totalRules = result.passed.length + result.failed.length;
      const preset = getPreset('financial');
      let expectedTotal = 0;
      for (const c of preset.compliance) {
        expectedTotal += c.requirements.length;
      }
      expect(totalRules).toBe(expectedTotal);
    });
  });

  // ---------------------------------------------------------------------------
  // getIndustryAntiPatterns
  // ---------------------------------------------------------------------------

  describe('getIndustryAntiPatterns', () => {
    it('should return antipatterns for each industry', () => {
      for (const industry of ALL_INDUSTRIES) {
        const antipatterns = getIndustryAntiPatterns(industry);
        expect(antipatterns).toBeDefined();
        expect(Array.isArray(antipatterns)).toBe(true);
      }
    });

    it('should have at least 5 per industry', () => {
      for (const industry of ALL_INDUSTRIES) {
        const antipatterns = getIndustryAntiPatterns(industry);
        expect(antipatterns.length).toBeGreaterThanOrEqual(5);
      }
    });

    it('each antipattern should have detection hint', () => {
      for (const industry of ALL_INDUSTRIES) {
        const antipatterns = getIndustryAntiPatterns(industry);
        for (const ap of antipatterns) {
          expect(ap.detectionHintKo).toBeTruthy();
          expect(typeof ap.detectionHintKo).toBe('string');
          expect(ap.detectionHintKo.length).toBeGreaterThan(10);
        }
      }
    });

    it('financial antipatterns should include card data related patterns', () => {
      const antipatterns = getIndustryAntiPatterns('financial');
      const names = antipatterns.map((ap) => ap.nameKo);
      expect(names.some((n) => n.includes('카드') || n.includes('결제'))).toBe(true);
    });

    it('healthcare antipatterns should include PHI related patterns', () => {
      const antipatterns = getIndustryAntiPatterns('healthcare');
      const names = antipatterns.map((ap) => ap.nameKo);
      expect(names.some((n) => n.includes('PHI') || n.includes('환자') || n.includes('의료'))).toBe(true);
    });

    it('government antipatterns should include access control patterns', () => {
      const antipatterns = getIndustryAntiPatterns('government');
      const names = antipatterns.map((ap) => ap.nameKo);
      expect(names.some((n) => n.includes('접근') || n.includes('통제') || n.includes('비밀'))).toBe(true);
    });

    it('ecommerce antipatterns should include availability patterns', () => {
      const antipatterns = getIndustryAntiPatterns('ecommerce');
      const names = antipatterns.map((ap) => ap.nameKo);
      expect(names.some((n) => n.includes('장애') || n.includes('SPOF') || n.includes('가용'))).toBe(true);
    });

    it('antipattern IDs should be unique within each industry', () => {
      for (const industry of ALL_INDUSTRIES) {
        const antipatterns = getIndustryAntiPatterns(industry);
        const ids = antipatterns.map((ap) => ap.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }
    });

    it('antipattern IDs should be unique across all industries', () => {
      const allIds: string[] = [];
      for (const industry of ALL_INDUSTRIES) {
        const antipatterns = getIndustryAntiPatterns(industry);
        allIds.push(...antipatterns.map((ap) => ap.id));
      }
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  // ---------------------------------------------------------------------------
  // Cross-cutting concerns
  // ---------------------------------------------------------------------------

  describe('cross-cutting validation', () => {
    it('all best practices should be non-empty Korean strings', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = getPreset(industry);
        for (const bp of preset.bestPracticesKo) {
          expect(typeof bp).toBe('string');
          expect(bp.length).toBeGreaterThan(10);
        }
      }
    });

    it('each preset should have exactly 8 best practices', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = getPreset(industry);
        expect(preset.bestPracticesKo).toHaveLength(8);
      }
    });

    it('required and recommended components should not overlap', () => {
      for (const industry of ALL_INDUSTRIES) {
        const preset = getPreset(industry);
        const requiredSet = new Set(preset.requiredComponents);
        for (const rec of preset.recommendedComponents) {
          expect(requiredSet.has(rec)).toBe(false);
        }
      }
    });
  });
});
