# Super Dashboard

Admin dashboard for SuperUp chat application. Built with React, Refine, and Ant Design.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Refine** - Headless admin panel framework
- **Ant Design 5** - UI component library
- **@ant-design/charts** - Data visualization
- **React Router v7** - Routing
- **i18next** - Internationalization (English & Arabic)
- **Socket.IO Client** - Real-time updates
- **Axios** - HTTP client

## Features

- **Dashboard** - Analytics overview with charts and statistics
- **User Management** - View, edit, ban/unban users
- **Room Management** - Groups, broadcasts, channels
- **Messages** - View and moderate messages
- **Calls** - Call history and analytics
- **Stories** - User stories management
- **Stickers** - Sticker packs management
- **Reports** - User reports handling
- **Notifications** - Push notification logs
- **Devices** - User devices tracking
- **Real-time Logs** - Live system logs via WebSocket
- **Config** - System configuration
- **Export** - Data export functionality
- **Audit Logs** - Admin activity tracking

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/super-up/super_dashboard.git
cd super_dashboard

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL
```

### Development

```bash
# Start dev server
pnpm dev
```

Open http://localhost:5173 in your browser.

### Building

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
super_dashboard/
├── public/
│   └── locales/          # i18n translation files
│       ├── en/           # English translations
│       └── ar/           # Arabic translations
├── src/
│   ├── components/       # Shared components
│   ├── config/           # API configuration
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # i18n setup
│   ├── pages/            # Page components
│   │   ├── dashboard/    # Dashboard with charts
│   │   ├── users/        # User management
│   │   ├── rooms/        # Room management
│   │   ├── messages/     # Message moderation
│   │   ├── calls/        # Call logs
│   │   ├── stories/      # Stories management
│   │   ├── stickers/     # Sticker packs
│   │   ├── reports/      # User reports
│   │   ├── notifications/# Push notifications
│   │   ├── devices/      # Device tracking
│   │   ├── realtime-logs/# Live logs
│   │   ├── config/       # System config
│   │   ├── export/       # Data export
│   │   ├── audit/        # Audit logs
│   │   └── login/        # Authentication
│   ├── providers/        # Refine providers
│   │   ├── authProvider.ts
│   │   ├── dataProvider.ts
│   │   └── i18nProvider.ts
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

## API Integration

This dashboard connects to the [SuperUp API](https://github.com/super-up/super_up_api) backend. Ensure the API is running before starting the dashboard.

## Internationalization

Supports English and Arabic with RTL layout. Translation files are in `public/locales/`.

To add a new language:
1. Create a new folder in `public/locales/{lang}/`
2. Copy JSON files from `en/` folder
3. Translate the values
4. Add language option in `LanguageSwitcher.tsx`

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Projects

- [SuperUp App](https://github.com/super-up/superup) - Flutter mobile/desktop app
- [SuperUp API](https://github.com/super-up/super_up_api) - NestJS backend API
