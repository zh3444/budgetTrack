/**
 * Logs a user in and retrieves a JWT token.
 * @param {object} params
 * @param {string} params.email - The user's email address.
 * @param {string} params.password - The user's password.
 * @returns {Promise<Response>} The response from the server.
 */
export const login = async ({ email, password }) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', email);
    return data;
  } catch (error) {
    console.log('An error occured ', error);
  }
}

/**
 * Registers a user and creates a new account.
 * @param {object} params
 * @param {string} params.name - The user's name.
 * @param {string} params.email - The user's email address.
 * @param {string} params.password - The user's password.
 * @returns {Promise<Response>} The response from the server.
 */
export const register = async (params) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('An error occured ', error);
  }
}

export const checkGmailTokenStatus = async (token) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-gmail-token`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('An error occurred ', error);
  }
}