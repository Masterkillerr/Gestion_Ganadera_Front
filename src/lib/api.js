export function apiError(error, fallback = 'Error en la operación') {
  if (!error) return fallback;

  const data = error?.response?.data;

  if (typeof data?.message === 'string' && data.message.trim().length > 0) {
    return data.message.trim();
  }

  if (typeof data?.error === 'string' && data.error.trim().length > 0) {
    return data.error.trim();
  }

  if (typeof data === 'string' && data.trim().length > 0) {
    return data.trim();
  }

  if (typeof error?.message === 'string' && error.message.trim().length > 0) {
    return error.message.trim();
  }

  return fallback;
}
