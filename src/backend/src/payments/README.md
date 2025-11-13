# M-Pesa Payment Integration

This module provides M-Pesa payment integration for the boutique e-commerce platform.

## Features

- **STK Push Integration**: Initiate M-Pesa payments via STK Push
- **Payment Status Tracking**: Monitor payment status in real-time
- **Callback Handling**: Automatic payment status updates via M-Pesa callbacks
- **Security**: Input validation and secure API communication
- **Error Handling**: Comprehensive error handling and logging

## Setup

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# M-Pesa Configuration (Sandbox)
MPESA_CONSUMER_KEY="your-mpesa-consumer-key"
MPESA_CONSUMER_SECRET="your-mpesa-consumer-secret"
MPESA_SHORTCODE="your-mpesa-shortcode"
MPESA_PASSKEY="your-mpesa-passkey"
MPESA_BASE_URL="https://sandbox.safaricom.co.ke"
BACKEND_URL="http://localhost:3000"
```

### Database Migration

The payment fields have been added to the Order model:

- `paymentStatus`: PENDING | PAID | FAILED | CANCELLED
- `paymentMethod`: MPESA | CARD | CASH
- `phoneNumber`: For M-Pesa payments
- `transactionId`: M-Pesa transaction reference
- `checkoutRequestId`: M-Pesa checkout request ID
- `paymentAmount`: Amount paid
- `paymentDate`: When payment was completed

## API Endpoints

### Initiate Payment

**POST** `/payments/initiate`

Initiate a payment for an order.

**Request Body:**
```json
{
  "orderId": 1,
  "paymentMethod": "MPESA",
  "phoneNumber": "0712345678",
  "amount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "STK Push sent successfully",
  "checkoutRequestId": "ws_CO_123456789",
  "responseCode": "0"
}
```

### Payment Callback

**POST** `/payments/callback`

M-Pesa callback endpoint for payment status updates.

**Request Body:**
```json
{
  "MerchantRequestID": "12345-67890",
  "CheckoutRequestID": "ws_CO_123456789",
  "ResponseCode": "0",
  "ResponseDescription": "Success",
  "CustomerMessage": "Success",
  "TransactionId": "RKT123456789"
}
```

### Check Payment Status

**POST** `/payments/status`

Check the status of a payment.

**Request Body:**
```json
{
  "orderId": 1
}
```

**Response:**
```json
{
  "orderId": 1,
  "paymentStatus": "PAID",
  "paymentMethod": "MPESA",
  "transactionId": "RKT123456789",
  "paymentDate": "2023-10-24T11:30:00.000Z"
}
```

## Frontend Integration

### Checkout Component

The checkout component has been updated to include:

- Payment method selection (M-Pesa, Card, Cash)
- Phone number input for M-Pesa payments
- Automatic payment initiation after order creation

### Order Interface

Updated Order interface includes payment fields:

```typescript
interface Order {
  id: number;
  paymentStatus: string;
  paymentMethod?: string;
  phoneNumber?: string;
  transactionId?: string;
  checkoutRequestId?: string;
  paymentAmount?: number;
  paymentDate?: string;
  // ... other fields
}
```

## Security Considerations

1. **Input Validation**: All inputs are validated using class-validator
2. **Phone Number Format**: Kenyan phone numbers are validated
3. **Amount Validation**: Payment amounts must be positive
4. **Authentication**: Payment initiation requires user authentication
5. **Error Logging**: All errors are logged for debugging

## Testing

### Sandbox Environment

The integration is configured for M-Pesa sandbox environment:

- Base URL: `https://sandbox.safaricom.co.ke`
- Use test credentials from Safaricom developer portal

### Test Flow

1. Create an order
2. Initiate M-Pesa payment
3. Check phone for STK Push prompt
4. Complete payment in M-Pesa app
5. Verify payment status via callback or status check

## Error Handling

The module includes comprehensive error handling:

- **Validation Errors**: Invalid inputs return detailed error messages
- **API Errors**: M-Pesa API errors are caught and handled gracefully
- **Database Errors**: Database operations are wrapped in try-catch blocks
- **Logging**: All errors are logged for debugging

## Troubleshooting

### Common Issues

1. **Invalid Phone Number**: Ensure phone number is in Kenyan format (07xxxxxxxx or 254xxxxxxxx)
2. **M-Pesa API Errors**: Check M-Pesa credentials and network connectivity
3. **Callback Issues**: Ensure BACKEND_URL is accessible from M-Pesa servers
4. **Payment Not Updating**: Check callback logs and payment status manually

### Logs

Check the application logs for detailed error information:

```bash
# View logs
npm run start:dev
```

All payment-related operations are logged with appropriate levels (info, error, warn).