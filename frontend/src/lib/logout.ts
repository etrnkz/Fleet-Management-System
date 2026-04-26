// Shared logout utility — clears all storage and server-side cookies

export async function logout(): Promise<void> {
  // Clear localStorage and sessionStorage
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
  }

  // Clear server-side cookies via API route
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch {}

  // Hard redirect to prevent back-button issues
  window.location.href = '/?logout=true'
}
