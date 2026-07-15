import { CONFIG } from './config';

/**
 * Registers a user via the backend API.
 */
export async function registerAPI(name: string, email: string, password: string): Promise<Response> {
  return fetch(`${CONFIG.API_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });
}
