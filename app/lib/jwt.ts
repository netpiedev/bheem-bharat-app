/**
 * Decode JWT token to get payload
 * Note: This doesn't verify the signature, just decodes the payload
 */
export const decodeJWT = (token: string): { userId?: string; phone?: string; role?: string } | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64 URL
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

/**
 * Get user ID from token
 */
export const getUserIdFromToken = (token: string): string | null => {
  const decoded = decodeJWT(token);
  return decoded?.userId || null;
};

