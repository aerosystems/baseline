const PROGRAM_STORAGE_KEY = 'baseline.program';

/**
 * Обрана в роадмапі навчальна програма. Зберігається в браузері викладача,
 * бо це його налаштування перегляду, а не властивість контенту.
 */
export function readSelectedProgram(courseSlug: string): string | null {
  try {
    return localStorage.getItem(`${PROGRAM_STORAGE_KEY}.${courseSlug}`);
  } catch {
    return null;   // приватний режим або заблоковані дані сайту
  }
}

export function writeSelectedProgram(courseSlug: string, programId: string | null): void {
  try {
    const key = `${PROGRAM_STORAGE_KEY}.${courseSlug}`;
    if (programId) localStorage.setItem(key, programId);
    else localStorage.removeItem(key);
  } catch {
    // збереження не обов'язкове
  }
}
