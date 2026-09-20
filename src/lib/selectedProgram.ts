const PROGRAM_STORAGE_KEY = 'baseline.program';

/**
 * The curriculum selected in the roadmap. Kept in the browser: it is a viewing
 * preference of whoever opened the site, not a property of the content.
 */
export function readSelectedProgram(courseSlug: string): string | null {
  try {
    return localStorage.getItem(`${PROGRAM_STORAGE_KEY}.${courseSlug}`);
  } catch {
    return null;   // private mode or site data blocked
  }
}

export function writeSelectedProgram(courseSlug: string, programId: string | null): void {
  try {
    const key = `${PROGRAM_STORAGE_KEY}.${courseSlug}`;
    if (programId) localStorage.setItem(key, programId);
    else localStorage.removeItem(key);
  } catch {
    // persisting is optional
  }
}
