# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Super Dashboard is an admin panel for the SuperUp chat platform built with React, Vite, and Refine framework. It
provides comprehensive management capabilities for users, messages, rooms, calls, stories, and system configuration.

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server with hot reload
pnpm dev

# Production build (includes TypeScript check)
pnpm build

# Preview production build
pnpm preview
```

## Project Architecture

### Directory Structure

```
src/
├── App.tsx              # Main app with Refine setup and routing
├── main.tsx             # Entry point
├── config/
│   └── api.ts           # API URLs, token handling, media URL helpers
├── providers/
│   ├── authProvider.ts  # JWT auth via /admin/auth/login endpoint
│   ├── dataProvider.ts  # Axios-based REST data provider
│   └── i18nProvider.ts  # i18next integration
├── hooks/
│   ├── useTheme.tsx     # Dark/light theme context
│   ├── useDashboardData.ts  # Dashboard statistics
│   └── useRealtimeLogs.ts   # Socket.IO realtime logs
├── components/          # Shared UI components
├── pages/               # Feature pages (list/show patterns)
├── types/               # TypeScript interfaces per domain
└── i18n/                # Translation files
```

### Key Technologies

- **Framework**: React 19 + Vite 7
- **Admin Framework**: Refine with Ant Design theme
- **UI Library**: Ant Design 5
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios with JWT interceptors
- **i18n**: i18next with browser detection
- **Charts**: @ant-design/charts
- **Real-time**: Socket.IO client

### Page Structure Pattern

Each feature follows list/show pattern:

```
pages/
├── users/
│   ├── list.tsx         # UserList - table with filters
│   └── show.tsx         # UserShow - detail view
├── messages/
│   ├── list.tsx
│   └── show.tsx
└── index.ts             # Barrel exports
```

### Resources (API Endpoints)

| Resource      | API Endpoint                   | Pages       |
|---------------|--------------------------------|-------------|
| Dashboard     | `/admin/dashboard/*`           | Dashboard   |
| Users         | `/admin/users`                 | List, Show  |
| Messages      | `/admin/messages`              | List, Show  |
| Rooms         | `/admin/rooms/groups`          | List, Show  |
| Reports       | `/admin/reports`               | List, Show  |
| Calls         | `/admin/calls`                 | List, Show  |
| Stories       | `/admin/stories`               | List, Show  |
| Audit         | `/admin/audit`                 | List        |
| Notifications | `/admin/notifications`         | List, Show  |
| Devices       | `/admin/devices`               | List, Show  |
| Countries     | `/admin/config/countries`      | List        |
| Stickers      | `/admin/config/stickers/packs` | List, Show  |
| App Config    | `/admin/config/app`            | Config page |
| Versions      | `/admin/config/versions`       | List        |
| Export        | `/admin/export`                | Export page |
| Realtime Logs | WebSocket                      | Logs page   |

## Environment Configuration

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_MEDIA_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

Defaults:

- Dev: `localhost:3000`
- Prod: `https://superupdev.online`

## Authentication Flow

1. Login via `POST /admin/auth/login` with email/password
2. JWT token stored in `localStorage` as `admin_token`
3. All requests include `Authorization: Bearer <token>` header
4. 401 responses trigger logout and redirect to `/login`
5. Auth check via `GET /admin/auth/me`

## Data Provider

Custom Refine data provider wrapping Axios:

- Pagination: `page` and `limit` params
- Filters: Field-value params (arrays comma-separated)
- Sorting: JSON `sort` param with `{field: 1|-1}` format
- Response format: `{ data: { docs: [], totalDocs: n } }` or array

## Theming

- Dark/light mode toggle via `ThemeProvider` context
- RTL support for Arabic (`i18n.language === "ar"`)
- Uses `RefineThemes.Blue` as base theme

## Adding New Features

1. Create types in `src/types/feature.types.ts`
2. Create pages in `src/pages/feature/list.tsx` and `show.tsx`
3. Export from `src/pages/index.ts`
4. Add resource config in `App.tsx` resources array
5. Add routes in `App.tsx` Routes section
6. Add navigation label in translation files

## Type Definitions

Each domain has dedicated types in `src/types/`:

- `user.types.ts` - User, Device, Ban
- `message.types.ts` - Message, Attachment
- `room.types.ts` - Room, Group, Broadcast
- `call.types.ts` - Call records
- `story.types.ts` - Story, StoryView
- `dashboard.types.ts` - Statistics
- `config.types.ts` - App configuration
