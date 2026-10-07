import { NextRequest, NextResponse } from 'next/server';
import {
  fetchGovItiTrainingData,
  fetchGovPmkvlyPlacementData,
  isDataGovConfigured,
} from '@/lib/gov/data-gov';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    const state = searchParams.get('state') || undefined;

    const configured = isDataGovConfigured();

    if (type === 'iti') {
      const itiData = await fetchGovItiTrainingData(state);
      return NextResponse.json({
        success: true,
        isConfigured: configured,
        dataType: 'Craftsmen Training Scheme (CTS) / ITI',
        ...itiData,
      });
    }

    if (type === 'pmkvy') {
      const pmkvyData = await fetchGovPmkvlyPlacementData(state);
      return NextResponse.json({
        success: true,
        isConfigured: configured,
        dataType: 'PMKVY State Placements',
        ...pmkvyData,
      });
    }

    // Default: Return both
    const [itiData, pmkvyData] = await Promise.all([
      fetchGovItiTrainingData(state),
      fetchGovPmkvlyPlacementData(state),
    ]);

    return NextResponse.json({
      success: true,
      isConfigured: configured,
      apiKeyPresent: Boolean(process.env.DATA_GOV_IN_API_KEY),
      itiStats: itiData,
      pmkvyStats: pmkvyData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to query government data';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
