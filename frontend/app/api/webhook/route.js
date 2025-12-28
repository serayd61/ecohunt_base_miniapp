import { NextResponse } from 'next/server';

// Farcaster MiniApp Webhook Handler
// This endpoint receives notifications from Farcaster about app interactions

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('🔔 Farcaster Webhook received:', JSON.stringify(body, null, 2));
    
    // Handle different webhook event types
    const { event, data } = body;
    
    switch (event) {
      case 'frame_added':
        // User added the mini app
        console.log('✅ User added EcoHunt:', data?.fid);
        break;
        
      case 'frame_removed':
        // User removed the mini app
        console.log('❌ User removed EcoHunt:', data?.fid);
        break;
        
      case 'notifications_enabled':
        // User enabled notifications
        console.log('🔔 Notifications enabled for:', data?.fid);
        break;
        
      case 'notifications_disabled':
        // User disabled notifications
        console.log('🔕 Notifications disabled for:', data?.fid);
        break;
        
      default:
        console.log('📨 Unknown webhook event:', event);
    }
    
    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    // Still return 200 to prevent retries for parse errors
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 200 });
  }
}

// Handle GET requests (for webhook verification)
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    app: 'EcoHunt',
    webhook: 'active',
    timestamp: new Date().toISOString()
  });
}

