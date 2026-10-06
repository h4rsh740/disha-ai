import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedGovSchemes, getNearbyGovCentres } from '@/lib/gov/skill-india';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const category = searchParams.get('category') || undefined;
  const state = searchParams.get('state') || undefined;
  const district = searchParams.get('district') || undefined;

  if (type === 'centres') {
    const centres = await getNearbyGovCentres(state, district);
    return NextResponse.json({
      portal: 'Skill India Digital Hub (SIDH) / DGT ITI Directory',
      ministry: 'Ministry of Skill Development and Entrepreneurship',
      centres,
    });
  }

  const schemes = await getVerifiedGovSchemes(category);
  return NextResponse.json({
    portal: 'Skill India Digital Hub (SIDH) / NSDC / DGT',
    ministry: 'Ministry of Skill Development and Entrepreneurship',
    schemes,
  });
}
