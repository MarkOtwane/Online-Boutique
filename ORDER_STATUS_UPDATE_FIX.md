# Order Status Update Fix

## Problem
Admin users were unable to update order status from the admin panel, receiving the error: "Failed to update order status. Please try again."

## Root Cause
There was a mismatch between the frontend status values and the backend PaymentStatus enum:

**Frontend status values:**
- `pending`
- `processing`
- `shipped`
- `completed`
- `cancelled`

**Backend PaymentStatus enum (in Prisma schema):**
- `PENDING`
- `PAID`
- `FAILED`
- `CANCELLED`

The backend was trying to directly convert frontend status values to uppercase and match them to the enum, which failed for values like `processing`, `shipped`, and `completed` that don't exist in the enum.

## Solution

### Backend Changes (backend/src/orders/orders.service.ts)

1. **Added status mapping function** to convert frontend status values to backend PaymentStatus enum:
   - `pending` → `PENDING`
   - `processing` → `PENDING`
   - `shipped` → `PAID`
   - `completed` → `PAID`
   - `cancelled` → `CANCELLED`
   - `failed` → `FAILED`

2. **Added reverse mapping** to convert backend PaymentStatus back to frontend format when returning data

3. **Added validation** to reject invalid status values with proper error messages

4. **Created helper method** `mapPaymentStatusToFrontend()` for consistent status mapping across all methods

### Frontend Changes

1. **Updated admin orders component** (frontend/src/app/admin/orders/orders.component.html):
   - Removed unsupported status options (`processing`, `shipped`)
   - Kept only valid options: `pending`, `completed`, `cancelled`, `failed`

2. **Updated status filter dropdown** to match available statuses

3. **Updated getStatusClass method** to handle the `failed` status

## Files Modified

- `backend/src/orders/orders.service.ts` - Added status mapping logic
- `frontend/src/app/admin/orders/orders.component.html` - Updated status dropdowns
- `frontend/src/app/admin/orders/orders.component.ts` - Updated status class handling

## Testing
The backend is running in watch mode and has automatically compiled the changes. You can now:

1. Log in as an admin user
2. Navigate to the Orders Management page
3. Update order status using the dropdown
4. The status should update successfully without errors

## Notes
- The backend uses `PaymentStatus` enum which is limited to payment-related states
- If you need more granular order statuses (like `processing`, `shipped`), consider:
  - Adding a separate `orderStatus` field to the Order model, OR
  - Extending the PaymentStatus enum in the Prisma schema