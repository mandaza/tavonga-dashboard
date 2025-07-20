# Tavonga Admin Dashboard

A comprehensive admin dashboard for Tavonga's Autism & Intellectual Disability Support System, built with Next.js and Tailwind CSS.

## Features

- **User Authentication**: Secure login system with role-based access
- **Dashboard Overview**: Real-time statistics and key metrics
- **Behavior Analytics**: Visual charts and reports for behavior tracking
- **Activity Management**: CRUD operations for activities and goals
- **Shift Management**: Schedule and monitor carer shifts
- **User Management**: Manage carer accounts and permissions
- **Reporting**: Export data in CSV/PDF formats
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Chart.js with react-chartjs-2
- **Data Fetching**: SWR
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

For testing purposes, use these demo credentials:
- **Email**: admin@tavonga.com
- **Password**: admin123

## Project Structure

```
tavonga-admin-dashboard/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Root page (redirects to login)
├── components/           # Reusable components
│   └── layout/          # Layout components (Sidebar, Header, etc.)
├── lib/                 # Utility functions and helpers
├── types/               # TypeScript type definitions
├── design.json          # Design system specifications
└── prd.md              # Product requirements document
```

## Design System

The dashboard follows a carefully crafted design system with:
- **Primary Color**: #4ECDC4 (Teal)
- **Background**: Clean white (#FFFFFF) with soft card backgrounds (#F9F5F4)
- **Typography**: Clear hierarchy with proper contrast
- **Components**: Consistent card design with subtle shadows and hover effects

## Development

The project is set up with TypeScript and follows modern React patterns. All components are built with accessibility in mind and follow the design specifications in `design.json`.

## License

This project is part of the Tavonga Autism & Intellectual Disability Support System. 