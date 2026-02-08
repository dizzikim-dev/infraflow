/**
 * ComponentForm Component Tests
 *
 * Tests for the component form including:
 * - Form rendering in create/edit modes
 * - Input validation
 * - Form submission
 * - Error handling
 * - Dynamic array field interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentForm from '@/components/admin/ComponentForm';

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: mockBack,
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock alert
const mockAlert = vi.fn();
Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true,
});

const mockInitialData = {
  id: 'comp-1',
  componentId: 'firewall',
  name: 'Firewall',
  nameKo: '방화벽',
  category: 'security',
  tier: 'dmz',
  description: 'Network security device that monitors incoming and outgoing traffic',
  descriptionKo: '네트워크 보안 장치',
  functions: ['Packet filtering', 'NAT'],
  functionsKo: ['패킷 필터링', 'NAT'],
  features: ['Stateful inspection'],
  featuresKo: ['상태 기반 검사'],
  ports: ['80', '443'],
  protocols: ['TCP', 'UDP'],
  vendors: ['Palo Alto', 'Fortinet'],
  policies: [],
};

describe('ComponentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Create Mode Rendering', () => {
    it('should render all form sections', () => {
      render(<ComponentForm mode="create" />);

      expect(screen.getByText('기본 정보')).toBeInTheDocument();
      expect(screen.getByText('설명')).toBeInTheDocument();
      expect(screen.getByText('기능 및 특징')).toBeInTheDocument();
      expect(screen.getByText('기술 정보')).toBeInTheDocument();
    });

    it('should render required field indicators', () => {
      render(<ComponentForm mode="create" />);

      // Count the asterisks (required field indicators)
      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators.length).toBeGreaterThan(0);
    });

    it('should render all basic info fields', () => {
      render(<ComponentForm mode="create" />);

      expect(screen.getByLabelText(/컴포넌트 ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/카테고리/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/영문명/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/한국어명/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/티어/i)).toBeInTheDocument();
    });

    it('should render description fields', () => {
      render(<ComponentForm mode="create" />);

      expect(screen.getByLabelText(/영문 설명/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/한국어 설명/i)).toBeInTheDocument();
    });

    it('should render category dropdown with all options', () => {
      render(<ComponentForm mode="create" />);

      const categorySelect = screen.getByLabelText(/카테고리/i);
      expect(categorySelect).toBeInTheDocument();

      // Check for options
      expect(screen.getByRole('option', { name: '보안' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '네트워크' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '컴퓨팅' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '클라우드' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '스토리지' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '인증' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '외부' })).toBeInTheDocument();
    });

    it('should render tier dropdown with all options', () => {
      render(<ComponentForm mode="create" />);

      const tierSelect = screen.getByLabelText(/티어/i);
      expect(tierSelect).toBeInTheDocument();

      expect(screen.getByRole('option', { name: '외부 (External)' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'DMZ' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '내부 (Internal)' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '데이터 (Data)' })).toBeInTheDocument();
    });

    it('should render create button', () => {
      render(<ComponentForm mode="create" />);

      expect(screen.getByRole('button', { name: '생성' })).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<ComponentForm mode="create" />);

      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });
  });

  describe('Edit Mode Rendering', () => {
    it('should populate form with initial data', () => {
      render(<ComponentForm mode="edit" initialData={mockInitialData} />);

      expect(screen.getByDisplayValue('firewall')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Firewall')).toBeInTheDocument();
      expect(screen.getByDisplayValue('방화벽')).toBeInTheDocument();
    });

    it('should disable componentId field in edit mode', () => {
      render(<ComponentForm mode="edit" initialData={mockInitialData} />);

      const componentIdInput = screen.getByLabelText(/컴포넌트 ID/i);
      expect(componentIdInput).toBeDisabled();
    });

    it('should render save button instead of create', () => {
      render(<ComponentForm mode="edit" initialData={mockInitialData} />);

      expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '생성' })).not.toBeInTheDocument();
    });

    it('should display existing array values as tags', () => {
      render(<ComponentForm mode="edit" initialData={mockInitialData} />);

      // Use queryAllByText to find elements that might appear as tags
      // The DynamicArrayField component shows values as tags
      // We should verify some values are displayed in the form
      const packetFilterElements = screen.queryAllByText('Packet filtering');
      const natElements = screen.queryAllByText('NAT');

      // At least one element should be present for each
      expect(packetFilterElements.length).toBeGreaterThanOrEqual(1);
      expect(natElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Form Validation', () => {
    it('should show error when componentId is empty', async () => {
      const user = userEvent.setup();
      render(<ComponentForm mode="create" />);

      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(screen.getByText('컴포넌트 ID를 입력하세요')).toBeInTheDocument();
    });

    it('should show error for invalid componentId format', async () => {
      const user = userEvent.setup();
      render(<ComponentForm mode="create" />);

      await user.type(screen.getByLabelText(/컴포넌트 ID/i), 'InvalidId');
      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(
        screen.getByText('kebab-case 형식으로 입력하세요 (예: load-balancer)')
      ).toBeInTheDocument();
    });

    it('should show error when name is empty', async () => {
      const user = userEvent.setup();
      render(<ComponentForm mode="create" />);

      await user.type(screen.getByLabelText(/컴포넌트 ID/i), 'valid-id');
      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(screen.getByText('영문명을 입력하세요')).toBeInTheDocument();
    });

    it('should show error when nameKo is empty', async () => {
      const user = userEvent.setup();
      render(<ComponentForm mode="create" />);

      await user.type(screen.getByLabelText(/컴포넌트 ID/i), 'valid-id');
      await user.type(screen.getByLabelText(/^영문명/i), 'Valid Name');
      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(screen.getByText('한국어명을 입력하세요')).toBeInTheDocument();
    });

    it('should show error when description is empty', async () => {
      const user = userEvent.setup();
      render(<ComponentForm mode="create" />);

      await user.type(screen.getByLabelText(/컴포넌트 ID/i), 'valid-id');
      await user.type(screen.getByLabelText(/^영문명/i), 'Valid Name');
      await user.type(screen.getByLabelText(/한국어명/i), '유효한 이름');
      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(screen.getByText('영문 설명을 입력하세요')).toBeInTheDocument();
    });

    it('should show error when descriptionKo is empty', async () => {
      const user = userEvent.setup();
      render(<ComponentForm mode="create" />);

      await user.type(screen.getByLabelText(/컴포넌트 ID/i), 'valid-id');
      await user.type(screen.getByLabelText(/^영문명/i), 'Valid Name');
      await user.type(screen.getByLabelText(/한국어명/i), '유효한 이름');
      await user.type(screen.getByLabelText(/영문 설명/i), 'Valid description');
      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(screen.getByText('한국어 설명을 입력하세요')).toBeInTheDocument();
    });

    it('should clear error when field is corrected', async () => {
      const user = userEvent.setup();
      render(<ComponentForm mode="create" />);

      // Submit to show error
      await user.click(screen.getByRole('button', { name: '생성' }));
      expect(screen.getByText('컴포넌트 ID를 입력하세요')).toBeInTheDocument();

      // Type valid value
      await user.type(screen.getByLabelText(/컴포넌트 ID/i), 'valid-id');

      // Error should be cleared
      expect(screen.queryByText('컴포넌트 ID를 입력하세요')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data in create mode', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'new-comp-id' }),
      });

      render(<ComponentForm mode="create" />);

      await user.type(screen.getByLabelText(/컴포넌트 ID/i), 'new-component');
      await user.type(screen.getByLabelText(/^영문명/i), 'New Component');
      await user.type(screen.getByLabelText(/한국어명/i), '새 컴포넌트');
      await user.type(screen.getByLabelText(/영문 설명/i), 'A new component');
      await user.type(screen.getByLabelText(/한국어 설명/i), '새로운 컴포넌트입니다');

      await user.click(screen.getByRole('button', { name: '생성' }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/components', expect.any(Object));
      });

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[1].method).toBe('POST');
    });

    it('should submit form with valid data in edit mode', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'comp-1' }),
      });

      render(<ComponentForm mode="edit" initialData={mockInitialData} />);

      // Modify a field
      const nameInput = screen.getByLabelText(/^영문명/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Firewall');

      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/components/comp-1', expect.any(Object));
      });

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[1].method).toBe('PUT');
    });

    it('should navigate to component detail on successful create', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'new-comp-id' }),
      });

      render(<ComponentForm mode="create" />);

      await user.type(screen.getByLabelText(/컴포넌트 ID/i), 'new-component');
      await user.type(screen.getByLabelText(/^영문명/i), 'New Component');
      await user.type(screen.getByLabelText(/한국어명/i), '새 컴포넌트');
      await user.type(screen.getByLabelText(/영문 설명/i), 'A new component');
      await user.type(screen.getByLabelText(/한국어 설명/i), '새로운 컴포넌트입니다');

      await user.click(screen.getByRole('button', { name: '생성' }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/components/new-comp-id');
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: () => ({ id: 'test' }) }), 100))
      );

      render(<ComponentForm mode="create" />);

      await user.type(screen.getByLabelText(/컴포넌트 ID/i), 'new-component');
      await user.type(screen.getByLabelText(/^영문명/i), 'New Component');
      await user.type(screen.getByLabelText(/한국어명/i), '새 컴포넌트');
      await user.type(screen.getByLabelText(/영문 설명/i), 'A new component');
      await user.type(screen.getByLabelText(/한국어 설명/i), '새로운 컴포넌트입니다');

      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(screen.getByRole('button', { name: '저장 중...' })).toBeInTheDocument();
    });

    it('should handle API error', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: '중복된 컴포넌트 ID입니다' }),
      });

      render(<ComponentForm mode="create" />);

      await user.type(screen.getByLabelText(/컴포넌트 ID/i), 'existing-id');
      await user.type(screen.getByLabelText(/^영문명/i), 'New Component');
      await user.type(screen.getByLabelText(/한국어명/i), '새 컴포넌트');
      await user.type(screen.getByLabelText(/영문 설명/i), 'A new component');
      await user.type(screen.getByLabelText(/한국어 설명/i), '새로운 컴포넌트입니다');

      await user.click(screen.getByRole('button', { name: '생성' }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('중복된 컴포넌트 ID입니다');
      });
    });

    it('should handle network error', async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<ComponentForm mode="create" />);

      await user.type(screen.getByLabelText(/컴포넌트 ID/i), 'new-component');
      await user.type(screen.getByLabelText(/^영문명/i), 'New Component');
      await user.type(screen.getByLabelText(/한국어명/i), '새 컴포넌트');
      await user.type(screen.getByLabelText(/영문 설명/i), 'A new component');
      await user.type(screen.getByLabelText(/한국어 설명/i), '새로운 컴포넌트입니다');

      await user.click(screen.getByRole('button', { name: '생성' }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Network error');
      });
    });
  });

  describe('Cancel Button', () => {
    it('should call router.back when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<ComponentForm mode="create" />);

      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Field Updates', () => {
    it('should update form data when input changes', async () => {
      const user = userEvent.setup();
      render(<ComponentForm mode="create" />);

      const componentIdInput = screen.getByLabelText(/컴포넌트 ID/i);
      await user.type(componentIdInput, 'test-id');

      expect(componentIdInput).toHaveValue('test-id');
    });

    it('should update category when select changes', async () => {
      const user = userEvent.setup();
      render(<ComponentForm mode="create" />);

      const categorySelect = screen.getByLabelText(/카테고리/i);
      await user.selectOptions(categorySelect, 'security');

      expect(categorySelect).toHaveValue('security');
    });

    it('should update tier when select changes', async () => {
      const user = userEvent.setup();
      render(<ComponentForm mode="create" />);

      const tierSelect = screen.getByLabelText(/티어/i);
      await user.selectOptions(tierSelect, 'dmz');

      expect(tierSelect).toHaveValue('dmz');
    });
  });
});
