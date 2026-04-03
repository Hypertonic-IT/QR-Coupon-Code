# QR Code Coupon Cashback System

A complete web application built with Next.js (App Router), Pure CSS, and MongoDB.

## Features
- **User Flow:**
  - Secure QR coupon scanning and redirection.
  - Cashback reward display with payment verification.
  - Details submission with screenshot upload (Cloudinary).
  - Validation to prevent double-use.
- **Admin Panel:**
  - Secure login (default: admin / admin123).
  - Dashboard statistics (Total QRs, Used, Total Payout).
  - QR Code Management (Bulk generation, A4 Print-ready PDF).
  - Submissions review with status toggle (Pending, Approved, Rejected, Paid).
  - CSV Data Export for easy tracking.

## Technology Stack
- **Frontend:** Next.js, Pure CSS, Lucide Icons
- **Backend:** Next.js API Routes
- **Database:** MongoDB (via Mongoose)
- **Storage:** Cloudinary (for payment screenshots)
- **Utilities:** QRCode.react, jsPDF, PapaParse

## Getting Started

### 1. Prerequisites
- Node.js (v18 or later)
- MongoDB (local instance or Atlas)
- Cloudinary Account (for image uploads)

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```bash
MONGODB_URI=mongodb://localhost:27017/qr-coupon-cashback
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Installation
```bash
npm install
```

### 4. Run Locally
```bash
npm run dev
```

### 5. Admin Access
Go to `/admin` to access the dashboard.
Default Credentials:
- **Username:** `admin`
- **Password:** `admin123`

## Project Structure
- `src/app`: App Router pages and API routes.
- `src/components`: Reusable UI components.
- `src/lib`: Shared utilities (DB, Cloudinary).
- `src/models`: Mongoose database schemas.
- `src/styles`: CSS variables and global styling.
