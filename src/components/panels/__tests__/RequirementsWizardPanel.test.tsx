import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RequirementsWizardPanel } from '../RequirementsWizardPanel';
import type { ConsultingRequirements } from '@/lib/consulting/types';

// Mock framer-motion to simplify rendering
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const {
        initial, animate, exit, transition,
        whileHover, whileTap, ...rest
      } = props;
      return <div {...rest}>{children as React.ReactNode}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ============================================================
// Helpers
// ============================================================

const defaultProps = {
  show: true,
  onClose: vi.fn(),
  onComplete: vi.fn(),
};

function renderWizard(overrides?: Partial<typeof defaultProps & { initialRequirements?: Partial<ConsultingRequirements> }>) {
  return render(<RequirementsWizardPanel {...defaultProps} {...overrides} />);
}

/** Fill out required fields on the current step, then click Next */
function fillOrganization() {
  // organizationSize and industry have defaults, so step is valid as-is
  fireEvent.click(screen.getByText('Next (다음)'));
}

function fillScale() {
  const userInput = screen.getByPlaceholderText('e.g. 10000');
  const concurrentInput = screen.getByPlaceholderText('e.g. 1000');
  fireEvent.change(userInput, { target: { value: '5000' } });
  fireEvent.change(concurrentInput, { target: { value: '500' } });
  fireEvent.click(screen.getByText('Next (다음)'));
}

function fillAvailability() {
  // availability has a default value, step is valid as-is
  fireEvent.click(screen.getByText('Next (다음)'));
}

function fillSecurity() {
  // security level has a default, valid as-is
  fireEvent.click(screen.getByText('Next (다음)'));
}

function fillBudget() {
  // budget has a default, valid as-is
  fireEvent.click(screen.getByText('Next (다음)'));
}

function fillPreferences() {
  // cloud preference has a default, valid as-is
  fireEvent.click(screen.getByText('Next (다음)'));
}

/** Navigate from step 1 all the way to the review step */
function navigateToReview() {
  fillOrganization();
  fillScale();
  fillAvailability();
  fillSecurity();
  fillBudget();
  fillPreferences();
}

// ============================================================
// Tests
// ============================================================

describe('RequirementsWizardPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ----------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------

  it('renders wizard with step indicator and first step content', () => {
    renderWizard();

    // Panel header
    expect(screen.getByText('Requirements Intake (요구사항 수집)')).toBeDefined();

    // Step indicator — all 7 step icons should be present via aria-labels
    expect(screen.getByLabelText('Organization (조직 정보)')).toBeDefined();
    expect(screen.getByLabelText('Scale (규모)')).toBeDefined();
    expect(screen.getByLabelText('Availability (가용성)')).toBeDefined();
    expect(screen.getByLabelText('Security (보안)')).toBeDefined();
    expect(screen.getByLabelText('Budget (예산)')).toBeDefined();
    expect(screen.getByLabelText('Preferences (선호 사항)')).toBeDefined();
    expect(screen.getByLabelText('Review (검토)')).toBeDefined();

    // Step counter
    expect(screen.getByText('1/7')).toBeDefined();

    // First step fields — FieldLabel splits EN/KO into parent + child span
    expect(screen.getByText(/Organization Name/)).toBeDefined();
    expect(screen.getByText(/Organization Size/)).toBeDefined();
    expect(screen.getByText(/Industry/)).toBeDefined();
  });

  it('does not render when show is false', () => {
    renderWizard({ show: false });
    expect(screen.queryByText('Requirements Intake (요구사항 수집)')).toBeNull();
  });

  // ----------------------------------------------------------
  // Navigation — Forward & Backward
  // ----------------------------------------------------------

  it('navigates forward through steps on Next click', () => {
    renderWizard();

    // Step 1: Organization
    expect(screen.getByText('1/7')).toBeDefined();
    fillOrganization();

    // Step 2: Scale
    expect(screen.getByText('2/7')).toBeDefined();
    expect(screen.getByText(/Total Users/)).toBeDefined();
  });

  it('navigates backward on Back click', () => {
    renderWizard();
    fillOrganization();

    // Now on step 2
    expect(screen.getByText('2/7')).toBeDefined();

    fireEvent.click(screen.getByText('Back (이전)'));

    // Back to step 1
    expect(screen.getByText('1/7')).toBeDefined();
    expect(screen.getByText(/Organization Name/)).toBeDefined();
  });

  it('Back button is disabled on the first step', () => {
    renderWizard();
    const backBtn = screen.getByText('Back (이전)').closest('button')!;
    expect(backBtn.disabled).toBe(true);
  });

  it('navigates all the way to review step', () => {
    renderWizard();
    navigateToReview();

    // Review step
    expect(screen.getByText('7/7')).toBeDefined();
    expect(screen.getByText('Submit (제출)')).toBeDefined();
  });

  // ----------------------------------------------------------
  // Validation — required fields
  // ----------------------------------------------------------

  it('validates required fields on Scale step', () => {
    renderWizard();
    fillOrganization();

    // On step 2, try to proceed without filling user count
    fireEvent.click(screen.getByText('Next (다음)'));

    // Should show validation error and stay on step 2
    expect(screen.getByText('2/7')).toBeDefined();
    expect(screen.getByText(/User count must be > 0/)).toBeDefined();
  });

  it('validates concurrent users cannot exceed total users', () => {
    renderWizard();
    fillOrganization();

    // Fill user count = 100, concurrent = 200
    fireEvent.change(screen.getByPlaceholderText('e.g. 10000'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 1000'), { target: { value: '200' } });
    fireEvent.click(screen.getByText('Next (다음)'));

    expect(screen.getByText(/Cannot exceed total users/)).toBeDefined();
  });

  // ----------------------------------------------------------
  // Review step — summary
  // ----------------------------------------------------------

  it('shows review summary with all entered data', () => {
    renderWizard();

    // Step 1: Fill org name
    const nameInput = screen.getByPlaceholderText('e.g. Acme Corp');
    fireEvent.change(nameInput, { target: { value: 'TestCorp' } });
    fillOrganization();

    // Step 2: Fill scale
    fillScale();

    // Steps 3-6: Use defaults
    fillAvailability();
    fillSecurity();
    fillBudget();
    fillPreferences();

    // Now on Review step
    expect(screen.getByText('7/7')).toBeDefined();

    // Verify review sections exist — section titles split EN/KO into parent + child span
    // Use getAllByText for terms that also appear in step indicator
    expect(screen.getAllByText(/Organization/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Scale/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Availability/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Security/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Budget/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Preferences/).length).toBeGreaterThanOrEqual(1);

    // Verify entered data appears
    expect(screen.getByText('TestCorp')).toBeDefined();
    expect(screen.getByText('5,000')).toBeDefined();
    expect(screen.getByText('500')).toBeDefined();
  });

  it('review Edit buttons navigate back to corresponding step', () => {
    renderWizard();
    navigateToReview();

    // Click Edit on Scale section
    const editButtons = screen.getAllByText('Edit');
    // Scale is the second section (index 1)
    fireEvent.click(editButtons[1]);

    // Should be back on Scale step
    expect(screen.getByText('2/7')).toBeDefined();
    expect(screen.getByText(/Total Users/)).toBeDefined();
  });

  // ----------------------------------------------------------
  // Submit — calls onComplete
  // ----------------------------------------------------------

  it('calls onComplete with correct data on submit', () => {
    const onComplete = vi.fn();
    renderWizard({ onComplete });

    // Step 1: Fill org
    fireEvent.change(screen.getByPlaceholderText('e.g. Acme Corp'), {
      target: { value: 'MyCorp' },
    });
    fillOrganization();

    // Step 2: Fill scale
    fillScale();

    // Steps 3-6: defaults
    fillAvailability();
    fillSecurity();
    fillBudget();
    fillPreferences();

    // Submit on review step
    fireEvent.click(screen.getByText('Submit (제출)'));

    expect(onComplete).toHaveBeenCalledTimes(1);
    const result = onComplete.mock.calls[0][0] as ConsultingRequirements;
    expect(result.organizationName).toBe('MyCorp');
    expect(result.organizationSize).toBe('medium');
    expect(result.industry).toBe('general');
    expect(result.userCount).toBe(5000);
    expect(result.concurrentUsers).toBe(500);
    expect(result.dataVolume).toBe('medium');
    expect(result.trafficPattern).toBe('steady');
    expect(result.availabilityTarget).toBe(99.9);
    expect(result.securityLevel).toBe('standard');
    expect(result.budgetRange).toBe('medium');
    expect(result.cloudPreference).toBe('hybrid');
  });

  // ----------------------------------------------------------
  // Initial requirements pre-fill
  // ----------------------------------------------------------

  it('handles initial requirements pre-fill', () => {
    renderWizard({
      initialRequirements: {
        organizationName: 'PrefilledCorp',
        organizationSize: 'large',
        industry: 'financial',
        userCount: 20000,
        concurrentUsers: 3000,
      },
    });

    // Step 1: Check pre-filled values
    const nameInput = screen.getByPlaceholderText('e.g. Acme Corp') as HTMLInputElement;
    expect(nameInput.value).toBe('PrefilledCorp');

    const sizeSelect = screen.getByDisplayValue(/Large/) as HTMLSelectElement;
    expect(sizeSelect.value).toBe('large');

    const industrySelect = screen.getByDisplayValue(/Financial/) as HTMLSelectElement;
    expect(industrySelect.value).toBe('financial');

    // Navigate to step 2 and check pre-filled scale
    fillOrganization();
    const userInput = screen.getByPlaceholderText('e.g. 10000') as HTMLInputElement;
    expect(userInput.value).toBe('20000');

    const concurrentInput = screen.getByPlaceholderText('e.g. 1000') as HTMLInputElement;
    expect(concurrentInput.value).toBe('3000');
  });

  // ----------------------------------------------------------
  // Close button
  // ----------------------------------------------------------

  it('close button calls onClose', () => {
    const onClose = vi.fn();
    renderWizard({ onClose });

    // PanelHeader renders close button with aria-label "닫기"
    const closeBtn = screen.getByLabelText('닫기');
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ----------------------------------------------------------
  // Compliance frameworks multi-select
  // ----------------------------------------------------------

  it('allows selecting compliance frameworks', () => {
    renderWizard();
    fillOrganization();
    fillScale();
    fillAvailability();

    // Now on Security step
    expect(screen.getByText('4/7')).toBeDefined();

    // Click PCI-DSS checkbox
    fireEvent.click(screen.getByText('PCI-DSS'));
    // Click HIPAA checkbox
    fireEvent.click(screen.getByText('HIPAA'));

    // Navigate to review
    fillSecurity();
    fillBudget();
    fillPreferences();

    // Check review shows selected frameworks
    expect(screen.getByText('PCI-DSS, HIPAA')).toBeDefined();
  });

  // ----------------------------------------------------------
  // Vendor multi-select
  // ----------------------------------------------------------

  it('allows selecting preferred vendors', () => {
    renderWizard();
    fillOrganization();
    fillScale();
    fillAvailability();
    fillSecurity();
    fillBudget();

    // Now on Preferences step (step 6)
    expect(screen.getByText('6/7')).toBeDefined();

    // Select Cisco and Fortinet
    fireEvent.click(screen.getByText('Cisco'));
    fireEvent.click(screen.getByText('Fortinet'));

    fillPreferences();

    // Review should show vendors
    expect(screen.getByText('cisco, fortinet')).toBeDefined();
  });

  // ----------------------------------------------------------
  // Step indicator click navigation
  // ----------------------------------------------------------

  it('allows clicking on completed step indicators to jump back', () => {
    renderWizard();
    fillOrganization();
    fillScale();

    // Now on step 3
    expect(screen.getByText('3/7')).toBeDefined();

    // Click step 1 indicator to go back
    fireEvent.click(screen.getByLabelText('Organization (조직 정보)'));

    expect(screen.getByText('1/7')).toBeDefined();
  });

  it('does not allow clicking on future step indicators', () => {
    renderWizard();

    // On step 1, clicking step 3 should do nothing
    fireEvent.click(screen.getByLabelText('Availability (가용성)'));

    // Should still be on step 1
    expect(screen.getByText('1/7')).toBeDefined();
  });
});
