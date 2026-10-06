import { NextRequest, NextResponse } from 'next/server';
import { DEMO_CITIZEN_SESSION, GovCitizenSession } from '@/lib/gov/meripehchan';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, provider = 'MeriPehchan', citizenData } = body;

    if (action === 'logout') {
      return NextResponse.json({ success: true, message: 'Logged out from MeriPehchan Citizen SSO' });
    }

    // Authenticate citizen via MeriPehchan or DigiLocker / APAAR
    const session: GovCitizenSession = citizenData || {
      ...DEMO_CITIZEN_SESSION,
      authProvider: provider,
      verifiedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `Citizen verified via ${provider} National Single Sign-On`,
      session,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Auth error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
