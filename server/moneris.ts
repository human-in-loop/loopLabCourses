import crypto from 'crypto';

export interface MonerisConfig {
  storeId: string;
  apiToken: string;
  environment: 'sandbox' | 'production';
}

export interface PaymentPreloadRequest {
  orderId: string;
  amount: string; // Amount in dollars (e.g., "29.99")
  description: string;
  customerId?: string;
  customerEmail?: string;
}

export interface PaymentPreloadResponse {
  success: boolean;
  ticket?: string;
  error?: string;
}

export class MonerisClient {
  private config: MonerisConfig;
  private baseUrl: string;

  constructor(config: MonerisConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production' 
      ? 'https://www3.moneris.com'
      : 'https://esqa.moneris.com';
  }

  async preloadPayment(request: PaymentPreloadRequest): Promise<PaymentPreloadResponse> {
    try {
      const preloadData: Record<string, string> = {
        store_id: this.config.storeId,
        api_token: this.config.apiToken,
        order_id: request.orderId,
        amount: request.amount,
        description: request.description,
        expiry_date: this.getExpiryDate(), // 24 hours from now
      };

      // Add optional fields only if they exist
      if (request.customerId) {
        preloadData.cust_id = request.customerId;
      }
      if (request.customerEmail) {
        preloadData.email = request.customerEmail;
      }

      const response = await fetch(`${this.baseUrl}/gateway2/servlet/MpgRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(preloadData).toString(),
      });

      const result = await response.text();
      
      // Parse Moneris XML response (simplified)
      // In production, use a proper XML parser
      if (result.includes('<ticket>')) {
        const ticketMatch = result.match(/<ticket>(.*?)<\/ticket>/);
        if (ticketMatch) {
          return {
            success: true,
            ticket: ticketMatch[1],
          };
        }
      }

      return {
        success: false,
        error: 'Failed to generate payment ticket',
      };
    } catch (error) {
      console.error('Moneris preload error:', error);
      return {
        success: false,
        error: 'Payment service unavailable',
      };
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Implement Moneris webhook signature verification
    // This would use HMAC-SHA256 with your webhook secret
    const expectedSignature = crypto
      .createHmac('sha256', process.env.MONERIS_WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  private getExpiryDate(): string {
    const now = new Date();
    now.setHours(now.getHours() + 24);
    return now.toISOString().slice(0, 19).replace('T', ' ');
  }
}

// Export singleton instance
export const monerisClient = new MonerisClient({
  storeId: process.env.MONERIS_STORE_ID || '',
  apiToken: process.env.MONERIS_API_TOKEN || '',
  environment: (process.env.MONERIS_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
});