# GPT Feedback Summary & Action Plan

> Date: 2026-02-21
> Context: ChatGPT Deep Research review → feedback on InfraFlow progress → critical review → action items

---

## 1. GPT Feedback Summary

### Round 1: Deep Research Review (context_deep-research-review.md)
- 15 recommendations evaluated: 6 already implemented, 5 judged overengineering, 4 actionable
- Item 1 (WAF Pillar Tags) + Item 2 (Evidence Panel) → **implemented**
- Item 3 (RAG) + Item 4 (Tool Use) → **deferred (conditional)**

### Round 2: GPT Follow-up Feedback (context_GPT feedback_260221.md)

**Agreed points:**
- RDF/OWL/SHACL overengineering at current scale — correct
- RAG deferral strategy — correct
- Architecture design tool scope — correct

**New suggestions:**
| Suggestion | GPT Priority | Our Assessment |
|---|---|---|
| A. Data drift management (`nextReviewDue`) | Medium | **Deferred** — `lastReviewedAt` exists; field without workflow = dead data |
| B. Vendor diversity rule (bias prevention) | High | **Accept with modified approach** — presentation, not algorithm |
| C. Evals golden test set | Medium-Long | **Deferred** — LLM only for parsing, recommendation is deterministic |
| D. Conditional re-evaluation triggers | Low | **Accept** — zero-cost documentation value |

### Round 3: GPT Implementation Proposal

GPT proposed post-processing reranking with `minDistinctVendors=3, maxPerVendor=2`.

**Critical review conclusion:** Wrong approach. The problem is not algorithmic bias but catalog coverage asymmetry (Cisco 214 products vs Arista 50). Reranking distorts scores and gives potentially worse advice. The correct solution is **presentation-layer vendor grouping** that preserves score integrity while ensuring cross-vendor visibility.

---

## 2. Action Plan

### Action A: Vendor Diversity — Presentation Approach (Size: M)

**Problem:** For node types where one vendor has many product variants (e.g., Cisco switches), Top-5 recommendations may show 3-4 Cisco models, hiding alternatives from other vendors.

**Solution:** Enhance `useEvidence` hook and `EvidencePanel` Recommendations tab to provide a "best per vendor" grouped view alongside the score-ranked list.

**Files:**

| File | Change |
|---|---|
| `src/hooks/useEvidence.ts` | Add `vendorGrouped` field: best product per vendor, sorted by score |
| `src/components/panels/EvidencePanel.tsx` | Add toggle in Recommendations tab: "By Score" vs "By Vendor" view |
| `src/hooks/__tests__/useEvidence.test.ts` | Add vendor grouping tests |
| `src/components/panels/__tests__/EvidencePanel.test.tsx` | Add toggle view tests |

**Design decisions:**
- Score-based ranking remains the default (no algorithmic distortion)
- "By Vendor" view groups products, shows best-per-vendor with expandable alternatives
- Preserves full scoring transparency — users see WHY a product ranked where it did
- No arbitrary constants (minDistinctVendors, maxPerVendor) needed

### Action B: Re-evaluation Triggers Documentation (Size: S)

**Problem:** "Don't do X now" decisions lack documented conditions for when to revisit.

**Solution:** Add a "Re-evaluation Triggers" section to the deep research review document.

**Triggers to document:**
1. Graph DB: when 3+ hop dependency traversal becomes core feature, or entity count exceeds ~5,000
2. RAG: when knowledge entries > 1,000 AND free-form query demand exists
3. Standard ontology (RDF/OWL): when external system integration (CMDB/NetBox) is required
4. OPA: when policy rules exceed ~100 or need hot-reload without deploy

### Action C: Update MEMORY.md (Size: S)

Record decisions and current state after this round of work.

---

## 3. Items NOT Acted On (with rationale)

| Item | Rationale |
|---|---|
| `nextReviewDue` field | No automated review workflow exists; field would be unmaintained dead data |
| Evals golden test set | LLM used only for parsing; recommendation engine is fully deterministic with 3,567 tests |
| Post-processing reranking | Distorts scores, requires arbitrary constants, masks true capability assessment |
| Vendor bias detection in scorer | No bias exists — scoring is purely capability-based; issue is catalog coverage asymmetry |

---

## Verification

After all changes:
```bash
npx tsc --noEmit && npx vitest run
```
