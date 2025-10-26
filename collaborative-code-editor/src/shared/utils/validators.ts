import { VALIDATION_RULES } from '../config/constants';

/**
 * Validation utility functions
 * All validators return { isValid: boolean, error?: string }
 */

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
    };
  }

  if (!VALIDATION_RULES.PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain uppercase, lowercase, number, and special character',
    };
  }

  return { isValid: true };
}

/**
 * Validate file name
 */
export function validateFileName(fileName: string): ValidationResult {
  if (!fileName) {
    return { isValid: false, error: 'File name is required' };
  }

  if (fileName.length > VALIDATION_RULES.FILE_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `File name must be less than ${VALIDATION_RULES.FILE_NAME_MAX_LENGTH} characters`,
    };
  }

  if (!VALIDATION_RULES.FILE_NAME_REGEX.test(fileName)) {
    return {
      isValid: false,
      error: 'File name can only contain letters, numbers, dots, hyphens, and underscores',
    };
  }

  return { isValid: true };
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): ValidationResult {
  if (!name) {
    return { isValid: false, error: 'Project name is required' };
  }

  if (name.length < VALIDATION_RULES.PROJECT_NAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Project name must be at least ${VALIDATION_RULES.PROJECT_NAME_MIN_LENGTH} characters`,
    };
  }

  if (name.length > VALIDATION_RULES.PROJECT_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Project name must be less than ${VALIDATION_RULES.PROJECT_NAME_MAX_LENGTH} characters`,
    };
  }

  return { isValid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(size: number): ValidationResult {
  if (size > VALIDATION_RULES.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${VALIDATION_RULES.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Validate URL
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
}

/**
 * Validate required field
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}
