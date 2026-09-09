/**
 * Utility for generating standardized default credentials for Students and Teachers.
 * 
 * Formula specified by user:
 * - Username: First 4 letters of Name + '-' + Year of Admission / Joining (e.g. Abdu-2026)
 * - Password: First 4 letters of Name + '@' + Year of Date of Birth (e.g. Abdu@2014)
 */

export function extractFirstFourLetters(name: string): string {
  // Strip common honorifics if there is a substantive name following
  const clean = name.trim().replace(/^(Qari|Maulana|Hafiz|Mufti|Ustadh|Sheikh|Janab|Mohammad|Md\.)\s+/i, '');
  const targetName = clean.length >= 4 ? clean : name.trim();
  
  // Extract alphabetic letters
  const lettersOnly = targetName.replace(/[^a-zA-Z]/g, '');
  
  if (lettersOnly.length >= 4) {
    const four = lettersOnly.slice(0, 4);
    return four.charAt(0).toUpperCase() + four.slice(1).toLowerCase();
  }
  
  // Fallback if name has fewer than 4 letters
  const padded = (lettersOnly || 'User').padEnd(4, 'x');
  return padded.charAt(0).toUpperCase() + padded.slice(1).toLowerCase();
}

export function extractYear(dateStr?: string, defaultYear: string = '2026'): string {
  if (!dateStr) return defaultYear;
  const match = dateStr.match(/\d{4}/);
  return match ? match[0] : defaultYear;
}

export function generateDefaultCredentials(
  name: string,
  admissionOrJoiningDate?: string,
  dobDate?: string
): { username: string; password: string } {
  const letters = extractFirstFourLetters(name);
  const admYear = extractYear(admissionOrJoiningDate, new Date().getFullYear().toString());
  const birthYear = extractYear(dobDate, '2014');

  return {
    username: `${letters}-${admYear}`,
    password: `${letters}@${birthYear}`
  };
}
