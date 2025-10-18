# Cloudinary Integration Setup

This application now uses Cloudinary for image storage and delivery instead of local file storage.

## Setup Instructions

### 1. Create a Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com) and create a free account
2. Navigate to your Dashboard and find your Cloud Name, API Key, and API Secret

### 2. Environment Variables
Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/boutique_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

Replace the values with your actual Cloudinary credentials.

### 3. Features
- **Automatic Upload**: Images are automatically uploaded to Cloudinary when products are created/updated
- **CDN Delivery**: Images are served via Cloudinary's global CDN for fast loading
- **Format Optimization**: Images are converted to PNG format for consistency
- **Organized Storage**: Images are stored in the 'boutique-products' folder in your Cloudinary account

### 4. Image URL Structure
After setup, product images will have URLs like:
```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/boutique-products/product-1234567890-12345.png
```

### 5. Benefits
- ✅ No local storage needed for images
- ✅ Fast global image delivery via CDN
- ✅ Automatic image optimization and resizing
- ✅ Secure cloud storage
- ✅ Easy backup and management

### 6. Troubleshooting
- Make sure your Cloudinary credentials are correct
- Check that the 'boutique-products' folder exists in your Cloudinary account
- Verify your account has upload permissions
- Check the console for any Cloudinary-related errors