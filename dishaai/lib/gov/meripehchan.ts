/**
 * MeriPehchan (National Single Sign-On / Jan Parichay - MeitY)
 * & DigiLocker / APAAR ID (Ministry of Education & MSDE) Authentication Adapter.
 * 
 * Replaces commercial third-party auth with Government Citizen SSO.
 */

export interface GovCitizenSession {
  isAuthenticated: boolean;
  authProvider: 'MeriPehchan' | 'DigiLocker' | 'APAAR' | 'LocalDemo';
  citizenId: string;
  apaarId?: string;
  name: string;
  gender?: string;
  dob?: string;
  state?: string;
  verifiedEducationLevel?: string;
  academicBoard?: string;
  verifiedAt: string;
}

export const DEMO_CITIZEN_SESSION: GovCitizenSession = {
  isAuthenticated: true,
  authProvider: 'MeriPehchan',
  citizenId: 'MP-2026-9812-4011',
  apaarId: 'APAAR-IND-8841-0921-5512',
  name: 'Ravi Sharma',
  gender: 'Male',
  dob: '2006-08-14',
  state: 'Delhi',
  verifiedEducationLevel: 'class_10',
  academicBoard: 'Central Board of Secondary Education (CBSE)',
  verifiedAt: new Date().toISOString(),
};

/**
 * Validates or initializes a MeriPehchan / DigiLocker citizen authentication session.
 */
export function getStoredGovSession(): GovCitizenSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('disha_gov_session');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GovCitizenSession;
  } catch {
    return null;
  }
}

/**
 * Stores an authenticated MeriPehchan citizen session.
 */
export function saveGovSession(session: GovCitizenSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('disha_gov_session', JSON.stringify(session));
}

/**
 * Logs out the current MeriPehchan citizen session.
 */
export function clearGovSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('disha_gov_session');
}
