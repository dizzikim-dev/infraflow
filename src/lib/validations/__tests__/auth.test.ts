import { describe, it, expect } from 'vitest';
import { LoginSchema, RegisterSchema } from '../auth';
import type { LoginInput, RegisterInput } from '../auth';

describe('auth validation schemas', () => {
  // ============================================================
  // LoginSchema
  // ============================================================

  describe('LoginSchema', () => {
    it('should accept valid email and password', () => {
      const input: LoginInput = {
        email: 'user@example.com',
        password: 'any-password',
      };
      const result = LoginSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept password with only 1 character (min is 1)', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'x',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(
          (i) => i.path[0] === 'password'
        );
        expect(passwordError).toBeDefined();
      }
    });

    it('should reject invalid email', () => {
      const result = LoginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(
          (i) => i.path[0] === 'email'
        );
        expect(emailError).toBeDefined();
      }
    });

    it('should reject empty email', () => {
      const result = LoginSchema.safeParse({
        email: '',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing email field', () => {
      const result = LoginSchema.safeParse({
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing password field', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty object', () => {
      const result = LoginSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = LoginSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject undefined', () => {
      const result = LoginSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should accept email with subdomain', () => {
      const result = LoginSchema.safeParse({
        email: 'user@sub.domain.co.kr',
        password: 'test',
      });
      expect(result.success).toBe(true);
    });

    it('should have Korean error message for invalid email', () => {
      const result = LoginSchema.safeParse({
        email: 'bad',
        password: 'test',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(
          (i) => i.path[0] === 'email'
        );
        expect(emailError?.message).toBe('유효한 이메일을 입력하세요');
      }
    });

    it('should have Korean error message for empty password', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(
          (i) => i.path[0] === 'password'
        );
        expect(passwordError?.message).toBe('비밀번호를 입력하세요');
      }
    });

    it('should strip extra fields (zod default behavior)', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'test',
        extra: 'field',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          email: 'user@example.com',
          password: 'test',
        });
      }
    });
  });

  // ============================================================
  // RegisterSchema — password validation
  // ============================================================

  describe('RegisterSchema', () => {
    const validInput: RegisterInput = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'StrongP@ss1234',
      confirmPassword: 'StrongP@ss1234',
    };

    it('should accept valid registration input', () => {
      const result = RegisterSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    // ----- Name validation -----

    describe('name field', () => {
      it('should reject name shorter than 2 characters', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          name: 'A',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const nameError = result.error.issues.find(
            (i) => i.path[0] === 'name'
          );
          expect(nameError?.message).toBe('이름은 2자 이상이어야 합니다');
        }
      });

      it('should accept name with exactly 2 characters', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          name: 'AB',
        });
        expect(result.success).toBe(true);
      });

      it('should accept name with exactly 50 characters', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          name: 'A'.repeat(50),
        });
        expect(result.success).toBe(true);
      });

      it('should reject name longer than 50 characters', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          name: 'A'.repeat(51),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const nameError = result.error.issues.find(
            (i) => i.path[0] === 'name'
          );
          expect(nameError?.message).toBe('이름은 50자 이하여야 합니다');
        }
      });

      it('should reject empty name', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          name: '',
        });
        expect(result.success).toBe(false);
      });

      it('should accept Korean name', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          name: '김현기',
        });
        expect(result.success).toBe(true);
      });
    });

    // ----- Email validation -----

    describe('email field', () => {
      it('should reject invalid email in registration', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          email: 'not-email',
        });
        expect(result.success).toBe(false);
      });

      it('should accept valid email', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          email: 'admin@infraflow.dev',
        });
        expect(result.success).toBe(true);
      });
    });

    // ----- Password strength validation -----

    describe('password strength', () => {
      it('should reject password shorter than 12 characters', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          password: 'Short@1a',
          confirmPassword: 'Short@1a',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const pwError = result.error.issues.find(
            (i) => i.path[0] === 'password'
          );
          expect(pwError?.message).toBe('비밀번호는 12자 이상이어야 합니다');
        }
      });

      it('should accept password with exactly 12 characters', () => {
        // 12 chars with upper, lower, digit, special
        const result = RegisterSchema.safeParse({
          ...validInput,
          password: 'Abcdefgh@1ab',
          confirmPassword: 'Abcdefgh@1ab',
        });
        expect(result.success).toBe(true);
      });

      it('should accept password with exactly 100 characters', () => {
        // Build a 100-char password: uppercase, lowercase, digit, special, then pad
        const pw = 'Aa1@' + 'x'.repeat(96);
        const result = RegisterSchema.safeParse({
          ...validInput,
          password: pw,
          confirmPassword: pw,
        });
        expect(result.success).toBe(true);
      });

      it('should reject password longer than 100 characters', () => {
        const pw = 'Aa1@' + 'x'.repeat(97);
        expect(pw.length).toBe(101);
        const result = RegisterSchema.safeParse({
          ...validInput,
          password: pw,
          confirmPassword: pw,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const pwError = result.error.issues.find(
            (i) =>
              i.path[0] === 'password' && i.message.includes('100')
          );
          expect(pwError).toBeDefined();
        }
      });

      it('should reject password missing uppercase letter', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          password: 'alllowercase@1',
          confirmPassword: 'alllowercase@1',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const regexError = result.error.issues.find(
            (i) =>
              i.path[0] === 'password' &&
              i.message.includes('대소문자')
          );
          expect(regexError).toBeDefined();
        }
      });

      it('should reject password missing lowercase letter', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          password: 'ALLUPPERCASE@1',
          confirmPassword: 'ALLUPPERCASE@1',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const regexError = result.error.issues.find(
            (i) =>
              i.path[0] === 'password' &&
              i.message.includes('대소문자')
          );
          expect(regexError).toBeDefined();
        }
      });

      it('should reject password missing digit', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          password: 'NoDigitsHere@@',
          confirmPassword: 'NoDigitsHere@@',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const regexError = result.error.issues.find(
            (i) =>
              i.path[0] === 'password' &&
              i.message.includes('숫자')
          );
          expect(regexError).toBeDefined();
        }
      });

      it('should reject password missing special character', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          password: 'NoSpecialChar1A',
          confirmPassword: 'NoSpecialChar1A',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const regexError = result.error.issues.find(
            (i) =>
              i.path[0] === 'password' &&
              i.message.includes('특수문자')
          );
          expect(regexError).toBeDefined();
        }
      });

      it('should reject empty password', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          password: '',
          confirmPassword: '',
        });
        expect(result.success).toBe(false);
      });

      it('should accept password with all allowed special characters', () => {
        // Regex allows: @$!%*?&#
        const specials = '@$!%*?&#';
        for (const char of specials) {
          const pw = `Abcdefgh${char}1ab`;
          const result = RegisterSchema.safeParse({
            ...validInput,
            password: pw,
            confirmPassword: pw,
          });
          expect(result.success).toBe(true);
        }
      });

      it('should accept password with mixed special characters', () => {
        const pw = 'MyP@$$w0rd!#';
        const result = RegisterSchema.safeParse({
          ...validInput,
          password: pw,
          confirmPassword: pw,
        });
        expect(result.success).toBe(true);
      });
    });

    // ----- Confirm password / refine -----

    describe('confirmPassword', () => {
      it('should reject when passwords do not match', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          password: 'StrongP@ss1234',
          confirmPassword: 'DifferentP@ss1234',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const confirmError = result.error.issues.find(
            (i) => i.path[0] === 'confirmPassword'
          );
          expect(confirmError?.message).toBe('비밀번호가 일치하지 않습니다');
        }
      });

      it('should accept when passwords match exactly', () => {
        const result = RegisterSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should reject empty confirmPassword', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          confirmPassword: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const confirmError = result.error.issues.find(
            (i) => i.path[0] === 'confirmPassword'
          );
          expect(confirmError).toBeDefined();
        }
      });

      it('should reject case-different confirmPassword', () => {
        const result = RegisterSchema.safeParse({
          ...validInput,
          password: 'StrongP@ss1234',
          confirmPassword: 'strongp@ss1234',
        });
        expect(result.success).toBe(false);
      });
    });

    // ----- Missing fields -----

    describe('missing fields', () => {
      it('should reject when name is missing', () => {
        const { name: _, ...rest } = validInput;
        const result = RegisterSchema.safeParse(rest);
        expect(result.success).toBe(false);
      });

      it('should reject when email is missing', () => {
        const { email: _, ...rest } = validInput;
        const result = RegisterSchema.safeParse(rest);
        expect(result.success).toBe(false);
      });

      it('should reject when password is missing', () => {
        const { password: _, ...rest } = validInput;
        const result = RegisterSchema.safeParse(rest);
        expect(result.success).toBe(false);
      });

      it('should reject when confirmPassword is missing', () => {
        const { confirmPassword: _, ...rest } = validInput;
        const result = RegisterSchema.safeParse(rest);
        expect(result.success).toBe(false);
      });

      it('should reject empty object', () => {
        const result = RegisterSchema.safeParse({});
        expect(result.success).toBe(false);
      });

      it('should reject null', () => {
        const result = RegisterSchema.safeParse(null);
        expect(result.success).toBe(false);
      });
    });

    // ----- Type inference check -----

    describe('type inference', () => {
      it('should produce correctly typed output on success', () => {
        const result = RegisterSchema.safeParse(validInput);
        expect(result.success).toBe(true);
        if (result.success) {
          // Verify the parsed output contains all expected fields
          const data: RegisterInput = result.data;
          expect(data.name).toBe(validInput.name);
          expect(data.email).toBe(validInput.email);
          expect(data.password).toBe(validInput.password);
          expect(data.confirmPassword).toBe(validInput.confirmPassword);
        }
      });
    });
  });
});
