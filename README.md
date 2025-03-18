# OlleMe - SaaS Platform for Beauty Professionals

OlleMe is a SaaS platform designed for beauty professionals (hairdressers, tattoo artists, beauticians) to help them manage appointments, showcase their business online, and automate client communications.

## Features

### For Professionals

- **Profile Creation**: Set up business details, hours, services, and a photo gallery
- **Interactive Calendar**: Manage appointments with an intuitive calendar interface
- **Automated Notifications**: Send SMS/email reminders to reduce no-shows

### For Clients

- **Location-based Search**: Find beauty services nearby with filtering options
- **Easy Booking**: Book appointments in just 3 clicks
- **Automatic Reminders**: Receive confirmations and reminders for upcoming appointments

## Tech Stack

### Frontend

- Next.js 14 (App Router) with TypeScript
- UI Components: Shadcn UI + Tailwind CSS
- Calendar: FullCalendar + React Datepicker

### Backend (MVP)

- Supabase: PostgreSQL, Auth, Storage
- Serverless: Vercel Edge Functions

### External Services

- Emails: Resend
- SMS: Twilio
- Maps: Google Maps API

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=your_resend_api_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Database Setup

The database schema is defined in the `supabase_schema.sql` file. To set up the database:

1. Create a new Supabase project
2. Run the SQL queries in the `supabase_schema.sql` file in the SQL Editor

## Project Structure

```
src/
├── app/
│   ├── (auth)/        # Authentication pages
│   ├── (dashboard)/   # Professional dashboard
│   └── (landing)/     # Public-facing pages
├── components/
│   ├── ui/            # UI components from shadcn
│   ├── forms/         # Form components
│   └── calendar/      # Calendar components
├── lib/
│   ├── supabase/      # Supabase client and helpers
│   └── services/      # Service functions
└── types/             # TypeScript types
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
