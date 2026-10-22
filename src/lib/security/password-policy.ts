/**
 * Standar Kebijakan Kata Sandi Kuat Administrator Era Waluyo
 * Mencegah kata sandi lemah atau mudah ditebak.
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0 - 4
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push("Kata sandi minimal 8 karakter.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Wajib mengandung minimal 1 huruf kapital (A-Z).");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Wajib mengandung minimal 1 huruf kecil (a-z).");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Wajib mengandung minimal 1 angka (0-9).");
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push("Wajib mengandung minimal 1 karakter simbol khusus (misal: @, #, $, !).");
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) score++;

  return {
    isValid: errors.length === 0,
    errors,
    score,
  };
}
