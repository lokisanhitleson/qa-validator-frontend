# QA Validator Frontend

A frontend-only **AI Platform for Quality Engineering** prototype built for Zensar. It simulates how QA engineers would upload project documents, review AI-generated requirements, explore auto-generated test cases, and visualize requirement-to-test coverage via a traceability matrix. There is no real AI or backend — all data comes from mock JSON loaded into React context after a simulated upload animation.

## Design Decisions

1. **React + Next.js for rapid prototyping** — React was chosen over other frontend frameworks to keep the prototype lightweight and quick to implement. Next.js App Router provides file-based routing and server components out of the box, eliminating boilerplate and speeding up development.

2. **Brand-aligned theme from Zensar's website** — The color palette was derived by inspecting Zensar's corporate website. Black (`#0a0a0a`), white (`#ffffff`), and deep blue (`#182798`) were selected as the primary theme colors to maintain brand consistency throughout the application.

3. **Login page and AuthGuard for secured access** — Although not part of the original requirement document, a login screen was added to prevent the inner application flow from being exposed. All project pages are wrapped in an `AuthGuard` component that redirects unauthenticated users to `/login`.

4. **Projects and segments for organizational hierarchy** — A project-level grouping was introduced so that requirements, test cases, and traceability data live under distinct projects. Within each project, a segment name is captured during upload (e.g., "Payment Module") to track and filter data per upload batch. This keeps multiple uploads organized and queryable.

5. **Two-tier navigation inspired by AWS Console** — Projects sit at the top level of the menu hierarchy in the navbar. Once a user selects a project, second-level items (Overview, Upload, Requirements, Test Cases, Traceability) load into a collapsible sidebar. This separation mirrors the AWS Console pattern of service-level navigation in the top bar and resource-level navigation in the side panel.

6. **Responsive navbar and sidebar** — Both the top navbar and sidebar are responsive. On smaller screens the sidebar collapses behind a hamburger toggle, and tables scroll horizontally to remain usable on mobile.

7. **Button filter for requirement types** — Functional and Non-Functional requirements are toggled via button-style filters rather than a dropdown, since there are only two types. If more types are introduced in the future, this can be swapped to a dropdown without structural changes.

8. **Full-width cards for test cases** — Test cases use full-width card layouts instead of a traditional table or grid. This accommodates collapsible test steps within each card, providing a cleaner reading experience when rows need to expand with detailed step data.

9. **Tabbed view for traceability matrix** — The traceability page splits the table matrix and node graph into separate tabs, allowing users to switch between a structured tabular view and a visual relationship diagram based on their preference.

## Component Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout — AuthProvider > ProjectDataProvider
│   ├── page.tsx                  # Root redirect: auth → /projects, else → /login
│   ├── globals.css               # CSS variables + Tailwind v4 theme tokens
│   ├── login/page.tsx            # Login form
│   └── projects/
│       ├── layout.tsx            # Projects layout: AuthGuard + Navbar (no sidebar)
│       ├── page.tsx              # Project cards grid
│       └── [projectId]/
│           ├── layout.tsx        # Project layout: AuthGuard + Navbar + Sidebar
│           ├── overview/         # Project overview with summary cards
│           ├── upload/           # Drag-drop upload with processing overlay
│           ├── requirements/     # Requirements table with type filters
│           ├── test-cases/       # Test case cards with collapsible steps
│           └── traceability/     # Traceability matrix + node graph (tabbed)
│
├── components/
│   ├── Logo.tsx                  # Zensar logo via next/image
│   ├── layout/
│   │   ├── AuthGuard.tsx         # Redirects unauthenticated users to /login
│   │   ├── Navbar.tsx            # Fixed top bar with logo, nav links, user menu
│   │   └── Sidebar.tsx          # Collapsible side navigation for project pages
│   ├── ui/
│   │   ├── Button.tsx            # Primary/outline variants, fullWidth support
│   │   ├── Input.tsx             # Labeled input field
│   │   ├── ProgressBar.tsx       # Animated progress bar (0-100%)
│   │   └── SegmentFilter.tsx     # Dropdown to filter data by upload segment
│   └── upload/
│       ├── FileDropzone.tsx      # Drag-and-drop file selection zone
│       ├── FileList.tsx          # Selected files with validation indicators
│       └── ProcessingOverlay.tsx # Modal overlay with staged progress animation
│
├── context/
│   ├── AuthContext.tsx            # Auth state, login/logout, localStorage persistence
│   └── ProjectDataContext.tsx     # Project data store, segment filtering, upload accumulation
│
├── data/                         # Mock JSON files (projects, requirements, test cases, traceability)
├── interfaces/                   # TypeScript interfaces for all domain models
├── services/
│   ├── auth.service.ts           # Hardcoded credential check + localStorage
│   └── upload.service.ts         # Simulated 5-stage processing, loads mock data
└── utils/
    ├── constants.ts              # App config, sidebar items, credentials, allowed extensions
    └── file-validation.ts        # File extension validation
```

## How to Run

### Prerequisites

- Node.js 18+
- npm

### Install and Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- **Username:** admin
- **Password:** admin123

### Other Commands

```bash
# Production build
npm run build

# Lint check
npm run lint
```

### Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** with React Compiler
- **TypeScript 5** (strict mode)
- **Tailwind CSS 4**
