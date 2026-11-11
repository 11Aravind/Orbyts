/**
 * Form Validation and Input Sanitization Utilities for InnBite
 */

/**
 * Strips HTML tags, script openers, and hidden control characters from text inputs.
 * @param {string} text - Raw input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (text) => {
  if (typeof text !== 'string') return text;
  return text
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove ASCII control characters
    .trim();
};

/**
 * Validates Admin Login Form fields
 * @param {{ email?: string, password?: string }} formData
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export const validateAdminLoginForm = ({ email, password }) => {
  const errors = {};

  if (email !== undefined) {
    const cleanEmail = sanitizeInput(email);
    if (!cleanEmail || cleanEmail.length < 3) {
      errors.email = 'Username or email must be at least 3 characters long.';
    } else if (cleanEmail.length > 100) {
      errors.email = 'Username or email cannot exceed 100 characters.';
    }
  }

  if (password !== undefined) {
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    } else if (password.length > 64) {
      errors.password = 'Password cannot exceed 64 characters.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates Category Form fields
 * @param {{ name?: string }} formData
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export const validateCategoryForm = ({ name }) => {
  const errors = {};

  if (name !== undefined) {
    const cleanName = sanitizeInput(name);
    if (!cleanName || cleanName.length < 2) {
      errors.name = 'Category name must be at least 2 characters.';
    } else if (cleanName.length > 40) {
      errors.name = 'Category name cannot exceed 40 characters.';
    } else if (!/^[a-zA-Z0-9\s&-]+$/.test(cleanName)) {
      errors.name = 'Category name contains invalid special characters.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
