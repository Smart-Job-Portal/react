# Smart Job Portal - Frontend

A modern, responsive React-based frontend application for a comprehensive job portal system that connects employers and job seekers.

## 🌟 Features

### For Job Seekers
- **User Registration & Authentication** - Email verification, secure login/logout
- **Job Search & Browse** - View all active job listings with search and filter options
- **Job Applications** - Apply to jobs with cover letters and resume uploads
- **Application Tracking** - Monitor the status of submitted applications
- **Profile Management** - Manage personal information and preferences

### For Employers
- **Job Management** - Create, edit, and delete job postings
- **Application Review** - View and manage applications for posted jobs
- **Candidate Management** - Accept or reject applications
- **Dashboard Analytics** - Track job performance and application metrics

### For Admins
- **Content Moderation** - Approve/reject job postings before publication
- **User Management** - Oversee all system users
- **System Analytics** - Monitor platform usage and performance

## 🏗️ Architecture & Tech Stack

### Frontend Technologies
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS v4** - Utility-first styling
- **Lucide React** - Beautiful icons

### Key Features
- **Responsive Design** - Mobile-first approach
- **TypeScript Integration** - Full type safety
- **Component-based Architecture** - Reusable UI components
- **Custom Hooks** - Efficient state management
- **Error Handling** - Comprehensive error boundaries and user feedback
- **File Upload** - Resume upload with validation
- **Form Validation** - Client-side validation for better UX

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, Modal, etc.)
│   ├── layout/          # Layout components (Header, Navigation)
│   ├── jobs/            # Job-related components
│   └── applications/    # Application-related components
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── jobs/            # Job-related pages
│   ├── applications/    # Application pages
│   └── admin/           # Admin pages
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── contexts/            # React contexts (Auth, etc.)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── constants/           # Application constants
└── lib/                 # Third-party library configurations
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-portal-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   VITE_API_BASE_URL=https://job-portal-api-nest.onrender.com
   VITE_APP_NAME=Job Portal
   VITE_APP_VERSION=1.0.0
   VITE_ENABLE_DEBUG=false
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 🔌 API Integration

The frontend integrates with a NestJS backend API with the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/forget-password` - Password reset request
- `POST /auth/resend-verification-email` - Resend verification email

### Jobs
- `GET /jobs` - Get all jobs
- `POST /jobs` - Create new job (Employers)
- `GET /jobs/:id` - Get job details
- `PATCH /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job
- `GET /jobs/my-jobs` - Get user's jobs (Employers)

### Applications
- `POST /applications/jobs/:jobId` - Submit application
- `GET /applications/my-applications` - Get user applications
- `GET /applications/jobs/:jobId` - Get job applications (Employers)
- `PATCH /applications/:id` - Update application status

### Admin
- `GET /admin/jobs` - Get all jobs for moderation
- `PATCH /admin/jobs/:id` - Approve/reject jobs

## 🎨 UI Components

### Core Components
- **Button** - Various styles and states
- **Input** - Form inputs with validation
- **Select** - Dropdown selections
- **TextArea** - Multi-line text input
- **Modal** - Overlay dialogs
- **Card** - Content containers

### Specialized Components
- **JobCard** - Job listing display
- **ApplicationModal** - Job application form
- **Header** - Navigation and user menu

## 🔒 Authentication & Authorization

The application implements JWT-based authentication with role-based access control:

- **JWT Token Management** - Secure token storage and refresh
- **Role-based Routing** - Different interfaces for different user types
- **Protected Routes** - Automatic redirection for unauthorized access
- **Session Management** - Automatic logout on token expiration

### User Roles
- **SEEKER** - Job seekers can browse and apply to jobs
- **EMPLOYER** - Employers can post jobs and manage applications
- **ADMIN** - Administrators can moderate content and manage users

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** - Full-featured interface
- **Tablet** - Adapted layout with touch-friendly controls
- **Mobile** - Optimized mobile experience with simplified navigation

## 🔍 Features in Detail

### Job Search & Filtering
- Real-time search by job title and description
- Filter by job status, location, and salary range
- Pagination for large datasets
- Sort options for better organization

### File Upload System
- Resume upload with file type validation
- File size limits and error handling
- Drag-and-drop interface
- File preview and management

### Form Validation
- Real-time validation feedback
- Custom validation rules
- Error message display
- Accessible form design

### State Management
- React Context for global state
- Custom hooks for data fetching
- Optimistic updates for better UX
- Error state handling

## 🚀 Deployment

### Production Build
```bash
npm run build
```

The build creates optimized static files in the `dist/` directory.

### Environment Variables for Production
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_NAME=Job Portal
NODE_ENV=production
```

### Hosting Options
- **Vercel** - Automatic deployments from Git
- **Netlify** - Static site hosting with CI/CD
- **AWS S3 + CloudFront** - Scalable static hosting
- **Azure Static Web Apps** - Microsoft's static hosting solution

## 🧪 Testing Recommendations

While not currently implemented, recommended testing approaches:

- **Unit Tests** - Jest + React Testing Library
- **Integration Tests** - Testing user workflows
- **E2E Tests** - Cypress for full application testing
- **Accessibility Tests** - Jest-axe for a11y compliance

## 📊 Performance Optimizations

- **Code Splitting** - Dynamic imports for route-based splitting
- **Lazy Loading** - Components loaded on demand
- **Image Optimization** - Responsive images and lazy loading
- **Bundle Analysis** - Webpack bundle analyzer for optimization
- **Caching Strategy** - Service worker for offline functionality

## 🔧 Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all dependencies are installed: `npm install`
   - Check TypeScript errors: `npm run type-check`
   - Verify environment variables are set correctly

2. **API Connection Issues**
   - Verify `VITE_API_BASE_URL` in `.env` file
   - Check network connectivity to backend
   - Inspect browser network tab for API errors

3. **Authentication Problems**
   - Clear browser localStorage/sessionStorage
   - Check JWT token expiration
   - Verify backend authentication service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

### Code Style Guidelines
- Use TypeScript for all new code
- Follow existing component patterns
- Add proper error handling
- Include JSDoc comments for complex functions
- Follow the established folder structure

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review the API documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and role management
  - Job posting and application system
  - Admin panel for content moderation
  - Responsive design and mobile support

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**