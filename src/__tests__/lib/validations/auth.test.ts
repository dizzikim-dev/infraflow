import { describe, it, expect } from 'vitest';
import { LoginSchema, RegisterSchema } from '@/lib/validations/auth';

describe('LoginSchema', () => {
  it('should accept valid login input', () => {
    const result = LoginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = LoginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const result = LoginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing fields', () => {
    const result = LoginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  const validInput = {
    name: 'Test User',
    email: 'user@example.com',
    password: 'Password1234!',
    confirmPassword: 'Password1234!',
  };

  it('should accept valid registration input', () => {
    const result = RegisterSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should reject short name', () => {
    const result = RegisterSchema.safeParse({ ...validInput, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('should reject name exceeding 50 chars', () => {
    const result = RegisterSchema.safeParse({ ...validInput, name: 'A'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = RegisterSchema.safeParse({ ...validInput, email: 'bad' });
    expect(result.success).toBe(false);
  });

  it('should reject password shorter than 12 chars', () => {
    const result = RegisterSchema.safeParse({
      ...validInput,
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });
    expect(result.success).toBe(false);
  });

  it('should accept password with exactly 12 chars', () => {
    const result = RegisterSchema.safeParse({
      ...validInput,
      password: 'Password12#!',
      confirmPassword: 'Password12#!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject password without uppercase', () => {
    const result = RegisterSchema.safeParse({
      ...validInput,
      password: 'password1234!',
      confirmPassword: 'password1234!',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password without lowercase', () => {
    const result = RegisterSchema.safeParse({
      ...validInput,
      password: 'PASSWORD1234!',
      confirmPassword: 'PASSWORD1234!',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password without digit', () => {
    const result = RegisterSchema.safeParse({
      ...validInput,
      password: 'Passworddddd!',
      confirmPassword: 'Passworddddd!',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password without special character', () => {
    const result = RegisterSchema.safeParse({
      ...validInput,
      password: 'Password12345',
      confirmPassword: 'Password12345',
    });
    expect(result.success).toBe(false);
  });

  it('should accept password with each allowed special character', () => {
    const specialChars = ['@', '$', '!', '%', '*', '?', '&', '#'];
    for (const char of specialChars) {
      const pw = `Password1234${char}`;
      const result = RegisterSchema.safeParse({
        ...validInput,
        password: pw,
        confirmPassword: pw,
      });
      expect(result.success).toBe(true);
    }
  });

  it('should reject mismatched passwords', () => {
    const result = RegisterSchema.safeParse({
      ...validInput,
      confirmPassword: 'Different1234!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('confirmPassword');
    }
  });

  it('should reject missing fields', () => {
    const result = RegisterSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
