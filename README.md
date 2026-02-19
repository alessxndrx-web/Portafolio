# Developer Portfolio

A modern, production-ready developer portfolio built with Next.js 14+, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- 🌐 **Bilingual Support**: Spanish (ES) and English (EN) with language switcher
- 🎨 **Dark Mode**: Toggle between light and dark themes
- 🔐 **Demo Authentication**: Protected routes for demo access
- 📱 **Fully Responsive**: Works on all devices
- 🎯 **Three Interactive Demos**:
  1. **Admin Dashboard**: User management, statistics, and settings
  2. **Mini POS System**: Product management, shopping cart, and sales history
  3. **Editable Landing Page**: CMS-like content editor with image uploads

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Validation**: Zod
- **Storage**: LocalStorage (no external databases)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Demo Credentials

To access protected demo routes, use these credentials:

- **Email**: `demo@site.com`
- **Password**: `demo1234`

## Routes

### Public Routes
- `/` - Home page
- `/projects` - Projects showcase
- `/about` - About page
- `/contact` - Contact form
- `/login` - Login page
- `/demos/editable-site` - Public editable landing page

### Protected Routes (Require Login)
- `/demos/dashboard` - Admin Dashboard demo
- `/demos/pos` - Mini POS demo
- `/demos/editable-site/admin` - Landing page admin panel

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── demos/             # Demo pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── demos/            # Demo-specific components
│   ├── ui/               # shadcn/ui components
│   ├── Footer.tsx        # Footer component
│   └── Navbar.tsx        # Navigation bar
├── lib/                  # Utilities and hooks
│   ├── useAuth.tsx       # Authentication hook
│   ├── useLocalStorage.ts # LocalStorage hook
│   ├── useTranslation.tsx # Translation hook
│   └── utils.ts          # Utility functions
├── translations/         # Translation files
│   ├── en.ts            # English translations
│   └── es.ts            # Spanish translations
└── types/               # TypeScript types
    └── index.ts        # Type definitions
```

## Features Details

### Admin Dashboard
- Overview statistics cards
- User CRUD operations (Create, Read, Update, Delete)
- Settings page with profile management
- All data persisted in LocalStorage

### Mini POS System
- Product management (CRUD)
- Shopping cart functionality
- Checkout system
- Sales history tracking
- All data persisted in LocalStorage

### Editable Landing Page
- Public-facing landing page
- Admin panel for content editing
- Image upload support (base64 storage)
- Real-time preview
- All content persisted in LocalStorage

## Development

The project uses:
- **TypeScript** for type safety
- **ESLint** for code quality
- **Tailwind CSS** for styling
- **shadcn/ui** for component library

## License

MIT
