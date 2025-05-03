import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache since we don't need persistence in this demo
// For production, you would use a database like Redis, MongoDB, etc.
interface UsageRecord {
  ip: string;
  regularChecks: {
    count: number;
    lastReset: Date;
  };
  detailedAnalysis: {
    count: number;
    lastReset: Date;
  };
}

// In-memory cache to store usage data
const usageCache = new Map<string, UsageRecord>();

// Daily limits
const REGULAR_CHECK_LIMIT = 3;
const DETAILED_ANALYSIS_LIMIT = 1;

// Get a unique identifier for the client
function getClientId(req: NextRequest): string {
  // Use IP address as identifier
  // In production, you might want to use something more reliable
  const ip = req.headers.get('x-forwarded-for') || 
             req.cookies.get('client-id')?.value ||
             req.headers.get('x-real-ip') || 
             'unknown-ip';
             
  return ip.toString();
}

// Check if the day has changed and reset counts if needed
function resetCountsIfNewDay(record: UsageRecord): void {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (record.regularChecks.lastReset < midnight) {
    record.regularChecks.count = 0;
    record.regularChecks.lastReset = now;
  }
  
  if (record.detailedAnalysis.lastReset < midnight) {
    record.detailedAnalysis.count = 0;
    record.detailedAnalysis.lastReset = now;
  }
}

// Initialize a new usage record
function initializeUsageRecord(ip: string): UsageRecord {
  return {
    ip,
    regularChecks: {
      count: 0,
      lastReset: new Date()
    },
    detailedAnalysis: {
      count: 0,
      lastReset: new Date()
    }
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const clientId = getClientId(request);
  
  // Get or create usage record
  let record = usageCache.get(clientId);
  if (!record) {
    record = initializeUsageRecord(clientId);
    usageCache.set(clientId, record);
  }
  
  // Reset counts if it's a new day
  resetCountsIfNewDay(record);
  
  // Return the current usage status
  return NextResponse.json({
    regularChecks: {
      used: record.regularChecks.count,
      limit: REGULAR_CHECK_LIMIT,
      remaining: Math.max(0, REGULAR_CHECK_LIMIT - record.regularChecks.count)
    },
    detailedAnalysis: {
      used: record.detailedAnalysis.count,
      limit: DETAILED_ANALYSIS_LIMIT,
      remaining: Math.max(0, DETAILED_ANALYSIS_LIMIT - record.detailedAnalysis.count)
    }
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();
    const { checkType } = data; // 'regular' or 'detailed'
    
    if (!checkType || (checkType !== 'regular' && checkType !== 'detailed')) {
      return NextResponse.json(
        { error: 'Invalid check type. Must be "regular" or "detailed".' },
        { status: 400 }
      );
    }
    
    const clientId = getClientId(request);
    
    // Get or create usage record
    let record = usageCache.get(clientId);
    if (!record) {
      record = initializeUsageRecord(clientId);
      usageCache.set(clientId, record);
    }
    
    // Reset counts if it's a new day
    resetCountsIfNewDay(record);
    
    // Check limits and increment counters
    if (checkType === 'regular') {
      if (record.regularChecks.count >= REGULAR_CHECK_LIMIT) {
        return NextResponse.json({
          success: false,
          error: 'Daily limit for regular checks reached',
          regularChecks: {
            used: record.regularChecks.count,
            limit: REGULAR_CHECK_LIMIT,
            remaining: 0
          },
          detailedAnalysis: {
            used: record.detailedAnalysis.count,
            limit: DETAILED_ANALYSIS_LIMIT,
            remaining: Math.max(0, DETAILED_ANALYSIS_LIMIT - record.detailedAnalysis.count)
          }
        });
      }
      record.regularChecks.count += 1;
    } else if (checkType === 'detailed') {
      if (record.detailedAnalysis.count >= DETAILED_ANALYSIS_LIMIT) {
        return NextResponse.json({
          success: false,
          error: 'Daily limit for detailed analysis reached',
          regularChecks: {
            used: record.regularChecks.count,
            limit: REGULAR_CHECK_LIMIT,
            remaining: Math.max(0, REGULAR_CHECK_LIMIT - record.regularChecks.count)
          },
          detailedAnalysis: {
            used: record.detailedAnalysis.count,
            limit: DETAILED_ANALYSIS_LIMIT,
            remaining: 0
          }
        });
      }
      record.detailedAnalysis.count += 1;
    }
    
    // Update the cache
    usageCache.set(clientId, record);
    
    // Return the updated usage status
    return NextResponse.json({
      success: true,
      regularChecks: {
        used: record.regularChecks.count,
        limit: REGULAR_CHECK_LIMIT,
        remaining: Math.max(0, REGULAR_CHECK_LIMIT - record.regularChecks.count)
      },
      detailedAnalysis: {
        used: record.detailedAnalysis.count,
        limit: DETAILED_ANALYSIS_LIMIT,
        remaining: Math.max(0, DETAILED_ANALYSIS_LIMIT - record.detailedAnalysis.count)
      }
    });
    
  } catch (error) {
    console.error('Error updating usage limit:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
