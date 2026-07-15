import { execSync } from 'child_process';
import { CONFIG } from './config';

/**
 * Resets the database to clean up users created during registration tests.
 * Only keeps default accounts (admin@eshop.com and test@eshop.com).
 */
export function resetDatabase() {
  try {
    execSync(`sqlite3 "${CONFIG.DB_PATH}" "DELETE FROM users WHERE email NOT IN ('admin@eshop.com', 'test@eshop.com');"`);
  } catch (error) {
    console.error('Failed to reset database using sqlite3 CLI:', error);
    throw error;
  }
}
