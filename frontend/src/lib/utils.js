export const getAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  
  // If it's a relative path (e.g. /uploads/avatars/...), prepend backend base URL
  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${backendBase}${url}`;
};
