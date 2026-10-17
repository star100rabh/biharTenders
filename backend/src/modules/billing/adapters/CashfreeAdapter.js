/**
 * @file backend/src/modules/billing/adapters/CashfreeAdapter.js
 * @description Cashfree PG implementation supporting modern v2023-08-01 API with seamless checkout and verification.
 */
import crypto from 'crypto';
import pino from 'pino';
import { IPaymentGateway } from './IPaymentGateway.js';
import { env } from '../../../config/env.js';

const logger = pino();

export class CashfreeAdapter extends IPaymentGateway {
  constructor() {
    super();
    this.appId = env.CASHFREE_APP_ID;
    this.secretKey = env.CASHFREE_SECRET_KEY;
    this.cashfreeEnv = (env.CASHFREE_ENV || 'TEST').toUpperCase();
    this.isSandbox = this.cashfreeEnv === 'TEST' || this.cashfreeEnv === 'SANDBOX';
    this.baseUrl = this.isSandbox
      ? 'https://sandbox.cashfree.com/pg'
      : 'https://api.cashfree.com/pg';
    this.apiVersion = '2023-08-01';

    if (this.appId && this.secretKey) {
      logger.info(`Cashfree Adapter initialized in ${this.cashfreeEnv} mode (${this.baseUrl}).`);
    } else {
      logger.warn('Cashfree credentials not detected. Cashfree Adapter running unconfigured.');
    }
  }

  get isConfigured() {
    return Boolean(this.appId && this.secretKey);
  }

  async createOrder({ orderId, amount, currency = 'INR', customerDetails, orderMeta, notes = {} }) {
    if (!this.isConfigured) {
      throw new Error('Cashfree credentials missing in backend environment.');
    }

    // Cashfree expects amount as float/number in INR (e.g. 10.00)
    const orderAmount = Number(amount);

    const generatedOrderId = orderId || `cf_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const payload = {
      order_id: generatedOrderId,
      order_amount: orderAmount,
      order_currency: currency,
      customer_details: {
        customer_id: customerDetails?.id ? String(customerDetails.id) : `cust_${Date.now()}`,
        customer_name: customerDetails?.name || 'Valued Contractor',
        customer_email: customerDetails?.email || 'contractor@bihartenders.in',
        customer_phone: customerDetails?.phone || '8933068171',
      },
      order_meta: {
        return_url: orderMeta?.returnUrl || 'https://bihartenders.onrender.com/pricing?order_id={order_id}',
        notify_url: orderMeta?.notifyUrl,
      },
      order_note: notes?.planName ? `Subscription: ${notes.planName}` : 'BiharTenders Pro Subscription',
      order_tags: typeof notes === 'object' ? notes : {},
    };

    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'x-client-id': this.appId,
          'x-client-secret': this.secretKey,
          'x-api-version': this.apiVersion,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error(`Cashfree order creation failed (${response.status}): ${JSON.stringify(data)}`);
        throw new Error(data.message || `Cashfree error: ${response.statusText}`);
      }

      logger.info(`Cashfree order created: ${data.order_id}, session: ${data.payment_session_id?.substring(0, 20)}...`);

      return {
        orderId: data.order_id,
        cfOrderId: data.cf_order_id,
        amount: data.order_amount,
        currency: data.order_currency,
        paymentSessionId: data.payment_session_id,
        gateway: 'cashfree',
        environment: this.isSandbox ? 'sandbox' : 'production',
      };
    } catch (err) {
      logger.error(`Failed to create Cashfree order: ${err.message}`);
      throw err;
    }
  }

  async fetchOrder(orderId) {
    if (!this.isConfigured) {
      throw new Error('Cashfree credentials missing in backend environment.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'x-client-id': this.appId,
          'x-client-secret': this.secretKey,
          'x-api-version': this.apiVersion,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error(`Cashfree fetchOrder failed: ${JSON.stringify(data)}`);
        throw new Error(data.message || `Cashfree fetch error: ${response.statusText}`);
      }

      return data;
    } catch (err) {
      logger.error(`Cashfree fetchOrder exception: ${err.message}`);
      throw err;
    }
  }

  async fetchPaymentsForOrder(orderId) {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}/payments`, {
        method: 'GET',
        headers: {
          'x-client-id': this.appId,
          'x-client-secret': this.secretKey,
          'x-api-version': this.apiVersion,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      logger.error(`Cashfree fetchPaymentsForOrder exception: ${err.message}`);
      return [];
    }
  }

  async verifyPayment({ orderId, paymentId }) {
    const order = await this.fetchOrder(orderId);
    if (!order) return { isPaid: false, error: 'Order not found on Cashfree' };

    if (order.order_status === 'PAID') {
      const payments = await this.fetchPaymentsForOrder(orderId);
      const successfulPayment = payments.find(p => p.payment_status === 'SUCCESS') || payments[0];
      return {
        isPaid: true,
        orderId: order.order_id,
        paymentId: successfulPayment?.cf_payment_id ? String(successfulPayment.cf_payment_id) : (paymentId || order.order_id),
        amount: order.order_amount,
        currency: order.order_currency,
        order,
      };
    }

    return {
      isPaid: false,
      status: order.order_status,
      error: `Order status is ${order.order_status}`,
    };
  }

  verifyWebhookSignature(rawBody, signature, timestamp) {
    if (!signature || !timestamp) return false;
    try {
      const dataToSign = `${timestamp}${rawBody}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(dataToSign)
        .digest('base64');
      return expectedSignature === signature;
    } catch (err) {
      logger.error(`Cashfree webhook signature verification error: ${err.message}`);
      return false;
    }
  }
}

export const cashfreeAdapter = new CashfreeAdapter();
