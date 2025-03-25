# AI Call Analyzer Frontend

This is the frontend application for the AI Call Analyzer project.

## Development

```bash
npm run dev
```

## Build for Production

```bash
npm run build
```

## Environment Variables

For production deployment, create a `.env.local` or `.env.production` file in the frontend directory with the following variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

Replace `https://your-backend-api-url.com` with your actual backend API URL.

## Development vs Production Mode

The application will operate in two modes:

1. **Development Mode (without NEXT_PUBLIC_API_URL)**: Uses mock data for development and testing
2. **Production Mode (with NEXT_PUBLIC_API_URL)**: Uses the actual backend API

## Demo Account

The application includes a demo account with the following credentials:
- Username: `demo`
- Password: `password`

Users can easily access the demo account by clicking the "Login with Demo Account" button on the login page.
