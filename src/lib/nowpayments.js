// src/lib/nowpayments.js
class NowPaymentsAPI {
    constructor() {
      this.apiKey = process.env.NEXT_PUBLIC_NOWPAYMENTS_API_KEY; // Changed to NEXT_PUBLIC
      this.baseURL = 'https://api.nowpayments.io/v1';
      this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    }
  
    async createPayment(amount, currency = 'usd', orderId, userId) {
      try {
        // Validate API key
        if (!this.apiKey) {
          throw new Error('NowPayments API key not configured');
        }
  
        console.log('Creating payment with NowPayments...', {
          amount, currency, orderId, userId
        });
  
        const response = await fetch(`${this.baseURL}/payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify({
            price_amount: amount,
            price_currency: currency.toLowerCase(),
            pay_currency: 'btc',
            ipn_callback_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/nowpayments/webhook`,
            order_id: orderId,
            order_description: `Deposit for user ${userId}`,
            success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/provider/wallet?status=success`,
            cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/provider/wallet?status=cancelled`,
          }),
        });
  
        console.log('NowPayments response status:', response.status);
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('NowPayments API error details:', errorText);
          
          if (response.status === 403) {
            throw new Error('Invalid NowPayments API key or insufficient permissions');
          } else if (response.status === 401) {
            throw new Error('NowPayments authentication failed');
          } else {
            throw new Error(`NowPayments API error: ${response.status} - ${errorText}`);
          }
        }
  
        const data = await response.json();
        console.log('NowPayments payment created:', data);
        
        return { success: true, data };
      } catch (error) {
        console.error('NowPayments API Error:', error);
        return { 
          success: false, 
          error: error.message,
          details: 'Check your API key and account status'
        };
      }
    }
  
    async getPaymentStatus(paymentId) {
      try {
        if (!this.apiKey) {
          throw new Error('NowPayments API key not configured');
        }
  
        const response = await fetch(`${this.baseURL}/payment/${paymentId}`, {
          headers: {
            'x-api-key': this.apiKey,
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('NowPayments Status Error:', error);
        return { success: false, error: error.message };
      }
    }
  
    verifyIPNSignature(payload, signature) {
      // For now, skip verification in development
      if (process.env.NODE_ENV === 'development') {
        console.log('IPN verification skipped in development');
        return true;
      }
  
      // Implement proper verification in production
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha512', this.ipnSecret);
      const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
      return calculatedSignature === signature;
    }
  
    // Demo mode for testing without real API key
    async createDemoPayment(amount, currency = 'usd', orderId, userId) {
      console.log('DEMO MODE: Creating mock payment');
      
      const mockPayment = {
        id: `demo_${Date.now()}`,
        invoice_url: 'https://nowpayments.io/demo-payment',
        pay_address: 'bc1qdemoaddressfortesting123456',
        pay_amount: (amount / 45000).toFixed(8), // Mock BTC amount
        price_amount: amount,
        order_id: orderId
      };
  
      return { success: true, data: mockPayment };
    }
  }
  
  export const nowPayments = new NowPaymentsAPI();