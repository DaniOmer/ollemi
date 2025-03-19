# Ollemi - Professional Services Booking Platform

Ollemi is a Next.js 14 application with TypeScript, Tailwind CSS, and Supabase integration for managing professional service bookings. It provides a platform for professionals to showcase their services and for clients to book appointments.

## Features

- **Authentication**: Email/password and Google OAuth login
- **User Profiles**: Professional and client profiles
- **Service Management**: Create and manage professional services
- **Appointment Booking**: Schedule and manage appointments
- **Image Storage**: Upload profile photos and gallery images
- **Internationalization**: Multi-language support (English and French)

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Hooks
- **Form Handling**: React Hook Form, Zod
- **Internationalization**: next-intl

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ollemi.git
   cd ollemi
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials and other environment variables

4. Set up Supabase:

   - Create a new Supabase project
   - Run the SQL schema in `supabase_schema.sql` in the Supabase SQL editor
   - Configure authentication providers (Email, Google)
   - Create storage buckets for profile photos and gallery images

5. Start the development server:
   ```bash
   npm run dev
   ```

## Supabase Setup

### Database Setup

1. Create a new Supabase project
2. Go to the SQL Editor in your Supabase dashboard
3. Copy the contents of `supabase_schema.sql` and run it
4. This will create all necessary tables with proper relationships and RLS policies

### Authentication Setup

1. Go to Authentication > Settings in your Supabase dashboard
2. Enable Email auth and set up any additional settings
3. For Google auth:
   - Go to Authentication > Providers
   - Enable Google
   - Create a Google OAuth application in Google Cloud Console
   - Add your Redirect URI (typically `https://your-project.supabase.co/auth/v1/callback`)
   - Copy the Client ID and Secret to Supabase

### Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create two buckets:
   - `profile-photos` for user profile pictures
   - `gallery-photos` for professional gallery images
3. Set up bucket policies:
   - For `profile-photos`: Allow authenticated users to upload their own photos
   - For `gallery-photos`: Allow professionals to upload to their own galleries

## Project Structure

```
ollemi/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── [locale]/    # Localized routes
│   │   ├── api/         # API routes
│   │   └── auth/        # Auth routes
│   ├── components/      # React components
│   │   ├── calendar/    # Calendar components
│   │   ├── forms/       # Form components
│   │   ├── layouts/     # Layout components
│   │   └── ui/          # UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   │   ├── services/    # Service functions
│   │   └── supabase/    # Supabase client
│   ├── messages/        # Internationalization messages
│   └── types/           # TypeScript type definitions
├── .env.example         # Example environment variables
├── next.config.ts       # Next.js configuration
├── supabase_schema.sql  # Supabase database schema
└── tailwind.config.js   # Tailwind CSS configuration
```

## Future Migration to FastAPI

This project is designed with future migration to FastAPI in mind:

| Supabase Feature      | FastAPI Equivalent                   |
| --------------------- | ------------------------------------ |
| Auth (Google, Email)  | Authlib + OAuth2                     |
| Storage (S3)          | MinIO or AWS SDK                     |
| Realtime (websockets) | WebSockets + Redis                   |
| Edge Functions        | Celery or FastAPI + Background Tasks |

The codebase uses abstraction layers to facilitate this migration:

- Authentication is abstracted in `src/lib/supabase/client.ts`
- API calls are abstracted in service files
- Database schema is documented in `supabase_schema.sql`

## License

This project is licensed under the MIT License.
