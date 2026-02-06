# 📚 RCA Library Management System - Frontend

A modern, responsive web application for the RCA Library Management System built with Next.js 14, featuring RCA MIS OAuth integration, role-based dashboards, and real-time functionality.

## 🚀 Features

### 🔐 Authentication & User Management
- **RCA MIS OAuth Integration** - Seamless student login using RCA MIS credentials
- **Dual Authentication System** - Students via MIS OAuth, Librarians via email/password
- **Role-Based Dashboards** - Separate interfaces for students and librarians
- **Secure Session Management** - JWT token handling with automatic refresh
- **Comprehensive Logout** - Multiple logout options with complete session cleanup

### 📱 User Interface
- **Responsive Design** - Mobile-first approach with desktop optimization
- **Modern UI Components** - Built with Tailwind CSS and Lucide icons
- **Dark/Light Theme Support** - Consistent branding with RCA colors
- **Intuitive Navigation** - Collapsible sidebars and breadcrumb navigation
- **Loading States** - Smooth loading indicators and skeleton screens

### 📖 Student Portal Features
- **Book Discovery** - Browse and search library catalog
- **Borrowing Management** - Request books and track borrowing history
- **Real-time Notifications** - Get updates on book availability and due dates
- **Profile Management** - View and update personal information
- **Dashboard Analytics** - Personal borrowing statistics and recommendations

### 👩‍💼 Librarian Portal Features
- **User Management** - Manage student and librarian accounts
- **Book Catalog Management** - Add, edit, and remove books from catalog
- **Borrowing Oversight** - Approve/reject borrowing requests and manage returns
- **Analytics Dashboard** - Library usage statistics and reporting
- **System Administration** - Configure system settings and permissions

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + React Query
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Forms**: React Hook Form with validation
- **Real-time**: Socket.IO client integration

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or pnpm package manager
- Backend API server running

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lms-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Configure your `.env.local` file:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001
   
   # RCA MIS OAuth (if needed for direct integration)
   NEXT_PUBLIC_MIS_LOGIN_URL=http://5.252.53.111:9099/auth/login
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000` to view the application.

### Production Build
```bash
npm run build
npm run start
```

### Other Commands
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format
```

## 🔑 Authentication Flow

### Student Authentication (RCA MIS OAuth)
1. Student clicks "Continue with RCA MIS" on home page
2. Redirected to RCA MIS OAuth login
3. After MIS authentication, redirected back with token
4. Frontend processes token via backend API
5. JWT tokens stored in localStorage
6. Automatic redirect to student dashboard (`/user`)

### Librarian Authentication (Email/Password)
1. Librarian selects "Librarian" tab on home page
2. Enters email and password credentials
3. Frontend validates with backend API
4. JWT tokens stored in localStorage
5. Automatic redirect to librarian dashboard (`/librarian`)

### Logout Process
1. User clicks logout (sidebar or TopBar dropdown)
2. Frontend calls backend logout API
3. Backend invalidates refresh token
4. Frontend clears localStorage and React Query cache
5. Redux state reset and redirect to home page

## 🗂️ Project Structure

```
app/
├── auth/
│   └── callback/          # OAuth callback handling
├── user/                  # Student portal pages
│   ├── books/            # Book browsing and search
│   ├── borrowings/       # Borrowing history and management
│   ├── notifications/    # User notifications
│   └── profile/          # User profile management
├── librarian/            # Librarian portal pages
│   ├── users/           # User management
│   ├── books/           # Book catalog management
│   ├── catalog/         # Library catalog overview
│   ├── reports/         # System reports
│   └── analytics/       # Usage analytics
└── page.tsx             # Home/Login page

components/
├── ui/                  # Reusable UI components
├── modals/              # Modal components
├── tables/              # Data table components
├── UserSidebar.tsx      # Student navigation
├── LibrarianSidebar.tsx # Librarian navigation
├── TopBar.tsx           # Header with user menu
└── ProtectedRoute.tsx   # Route protection

hooks/
├── useAuth.ts           # Authentication state management
├── useBooks.ts          # Book data management
├── useBorrowings.ts     # Borrowing data management
└── usePagination.ts     # Pagination logic

services/
├── authService.ts       # Authentication API calls
├── booksService.ts      # Book-related API calls
└── borrowingsService.ts # Borrowing API calls

store/
├── index.ts             # Redux store configuration
└── slices/              # Redux slices
    ├── authSlice.ts     # Authentication state
    ├── booksSlice.ts    # Books state
    └── borrowingsSlice.ts # Borrowings state
```

## 🎨 UI/UX Features

### Responsive Design
- **Mobile-first approach** with progressive enhancement
- **Collapsible sidebars** that adapt to screen size
- **Touch-friendly interactions** for mobile devices
- **Optimized layouts** for tablets and desktops

### Accessibility
- **Keyboard navigation** support
- **Screen reader compatibility** with proper ARIA labels
- **High contrast ratios** for better readability
- **Focus indicators** for interactive elements

### Performance
- **Code splitting** with Next.js automatic optimization
- **Image optimization** with Next.js Image component
- **Lazy loading** for improved initial load times
- **Caching strategies** with React Query

## 🔒 Security Features

- **JWT token management** with automatic refresh
- **Protected routes** with role-based access control
- **XSS protection** through proper data sanitization
- **CSRF protection** via backend integration
- **Secure token storage** in localStorage with cleanup

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Docker
```bash
# Build Docker image
docker build -t lms-frontend .

# Run container
docker run -p 3000:3000 lms-frontend
```

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for async operations
- Write meaningful commit messages

## 🐛 Troubleshooting

### Common Issues

**Authentication not working**
- Check if backend server is running
- Verify environment variables are set correctly
- Clear localStorage and try again

**Styles not loading**
- Run `npm run build` to regenerate Tailwind CSS
- Check if Tailwind config is correct

**API calls failing**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check network tab for detailed error messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the browser console for error messages

---

**Built with ❤️ for RCA Library Management System**#   r c a - l i b r a r y  
 #   n e w - r c a - l i b r a r y  
 