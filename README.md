# 📋 Case Management System

> A comprehensive, enterprise-grade RESTful API backend for managing cases, users, payments, and service records with role-based access control.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.1.0-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v6.18.0-teal.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-blue.svg)](https://www.postgresql.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange.svg)](https://firebase.google.com/)

## 🚀 Overview

A robust case management backend system designed for organizations to efficiently track and manage client cases, service records, payments, and team workflows. Built with modern technologies and best practices, this system provides secure authentication, role-based authorization, audit logging, and comprehensive payment processing capabilities.

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Firebase Authentication Integration** - Secure user authentication using Firebase
- **JWT-based Sessions** - Stateless authentication with access and refresh tokens
- **Role-Based Access Control (RBAC)** - Four user roles: Admin, Manager, Finance, and Client
- **Multi-level Authorization Middleware** - Granular access control for different endpoints

### 📊 Case Management
- **Complete Case Lifecycle** - Track cases from creation to closure
- **Status Management** - PENDING → UNDER_REVIEW → IN_PROGRESS → COMPLETED → CLOSED
- **Dynamic Case Assignment** - Assign cases to managers for handling
- **Advanced Search** - Full-text search capabilities with pagination
- **Case Attachments** - Support for multiple file attachments per case

### 👥 User Management
- **Multi-role User System** - Support for Admin, Manager, Finance, and Client roles
- **Profile Management** - Complete user profile CRUD operations
- **Admin-created Accounts** - Special handling for accounts created by administrators
- **User Activity Tracking** - Comprehensive audit logs for all user actions

### 💰 Payment Processing
- **Multiple Payment Methods** - UPI, Card, Bank Transfer, and Other
- **Payment Status Tracking** - PENDING → PROCESSING → SUCCESS/FAILED/CANCELLED
- **Refund Management** - Complete refund processing with audit trail
- **Invoice Generation** - Automated PDF invoice creation using PDFKit
- **Transaction References** - Support for transaction IDs and reference codes

### 📝 Service Records
- **Work Tracking** - Document all work done on cases
- **Task Management** - TODO, IN_PROGRESS, DONE status tracking
- **Notes System** - Add multiple notes to service records
- **Automated Logging** - Automatic service record creation for key actions

### 🔍 Audit & Compliance
- **Comprehensive Audit Logs** - Track all CREATE, UPDATE, DELETE, ASSIGN operations
- **User Action History** - Complete trail of user activities
- **Payment Audit** - Full payment and refund tracking
- **Case History** - Detailed timeline of case status changes

### 🛡️ Security Features
- **Rate Limiting** - Protection against brute-force attacks
- **Password Encryption** - BCrypt hashing for secure password storage
- **CORS Protection** - Configurable cross-origin resource sharing
- **Cookie Security** - Secure cookie handling for tokens
- **Input Validation** - Comprehensive request validation

### ☁️ Cloud Integration
- **Cloudinary Integration** - Cloud-based file storage for attachments
- **Firebase Admin SDK** - Server-side Firebase operations
- **Email Notifications** - Nodemailer integration for email alerts

## 🏗️ Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express.js v5.1.0 |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 6.18.0 |
| **Authentication** | Firebase Auth + JWT |
| **File Storage** | Cloudinary |
| **Email** | Nodemailer |
| **PDF Generation** | PDFKit |
| **Containerization** | Docker Compose |

### Database Schema

```
User (ADMIN, MANAGER, FINANCE, CLIENT)
  ├── Cases Created
  ├── Cases Assigned
  ├── Service Records
  ├── Payments
  ├── Audit Logs
  └── Attachments

Case
  ├── Status Tracking
  ├── Service Records
  ├── Payments
  ├── Attachments
  └── Audit Logs

Payment
  ├── Transaction Details
  ├── Invoice URL
  └── Refund (1:1)

ServiceRecord
  └── Notes Array

AuditLog
  └── Action Tracking
```

## 📁 Project Structure

```
case-manager/
├── src/
│   ├── controllers/        # Business logic layer
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── case.controller.js
│   │   ├── payment.controller.js
│   │   ├── servicerecord.controller.js
│   │   ├── attachment.controller.js
│   │   └── admin.controller.js
│   ├── routes/             # API route definitions
│   ├── middlewares/        # Authentication & validation
│   │   ├── jwt_auth.middleware.js
│   │   ├── admin_auth.middleware.js
│   │   ├── manager_auth.middleware.js
│   │   ├── finance_auth.middleware.js
│   │   └── ratelimiter.middleware.js
│   ├── utilities/          # Helper functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── auditlog.js
│   │   ├── cloudinary.js
│   │   ├── invoice.js
│   │   └── encrypt.js
│   ├── prisma/             # Database schema & migrations
│   ├── db/                 # Database connection
│   ├── app.js              # Express app configuration
│   └── index.js            # Application entry point
├── compose.yaml            # Docker Compose configuration
└── package.json
```

## 🔌 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /firebaseLogin` - Login with Firebase credentials
- `POST /adminAuth` - Admin login/register
- `PATCH /logout` - User logout
- `PATCH /refresh` - Refresh access token

### Users (`/api/v1/users`)
- User profile management
- User listing and search
- Role-based filtering

### Cases (`/api/v1/cases`)
- `POST /` - Create new case
- `GET /manager` - Get cases assigned to manager
- `GET /:caseId` - Get case details
- `PATCH /:caseId/assign/:managerId` - Assign case to manager
- `PATCH /:caseId/status` - Update case status
- `DELETE /:caseId` - Close case
- `GET /search` - Search cases with pagination

### Payments (`/api/v1/payments`)
- Payment creation and processing
- Payment status updates
- Refund processing
- Invoice generation

### Service Records (`/api/v1/servicerecords`)
- Create and update service records
- Add notes to cases
- Track work progress

### Attachments (`/api/v1/attachments`)
- Upload case attachments
- Download attachments
- Attachment management

### Admin (`/api/v1/admin`)
- Administrative operations
- User management
- System configuration

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- PostgreSQL 16
- Docker & Docker Compose (optional)
- Firebase project with authentication enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/case-manager.git
   cd case-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   CORS_ORIGIN=http://localhost:3000
   
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5433/prisma
   
   # JWT
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=7d
   
   # Firebase
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

4. **Start PostgreSQL using Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Run Prisma migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 🧪 Testing

The API can be tested using tools like:
- Postman
- Thunder Client
- cURL
- Insomnia

## 📊 Database Management

### Prisma Studio
Access the Prisma Studio GUI to view and edit your database:
```bash
npx prisma studio
```

### Migrations
Create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

## 🔑 Role Permissions

| Feature | Client | Manager | Finance | Admin |
|---------|--------|---------|---------|-------|
| Create Case | ✅ | ✅ | ❌ | ✅ |
| View Own Cases | ✅ | ✅ | ❌ | ✅ |
| Assign Cases | ❌ | ❌ | ❌ | ✅ |
| Update Case Status | ❌ | ✅ | ❌ | ✅ |
| Process Payments | ❌ | ❌ | ✅ | ✅ |
| Issue Refunds | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| View Audit Logs | ❌ | ✅ | ✅ | ✅ |

## 🛠️ Technical Highlights

### Design Patterns
- **MVC Architecture** - Separation of concerns with controllers, models, and routes
- **Middleware Pattern** - Composable authentication and authorization
- **Error Handling** - Centralized error handling with custom ApiError class
- **Async Wrapper** - Clean async/await error handling with asyncHandler utility

### Best Practices
- **Environment Configuration** - Secure configuration management with dotenv
- **Input Validation** - Comprehensive request validation
- **SQL Injection Protection** - Prisma ORM parameterized queries
- **CORS Configuration** - Secure cross-origin requests
- **Rate Limiting** - DDoS and brute-force protection
- **Audit Logging** - Complete action history for compliance

### Code Quality
- **ES Modules** - Modern JavaScript module system
- **Prettier** - Code formatting consistency
- **Error Handling** - Comprehensive try-catch and error responses
- **Modular Structure** - Clear separation of concerns

## 📈 Scalability Features

- **Pagination Support** - Efficient data retrieval for large datasets
- **Search Optimization** - Indexed database queries
- **Connection Pooling** - Prisma connection management
- **Stateless Authentication** - Horizontal scaling ready
- **Cloud Storage** - Cloudinary for scalable file storage
- **Database Migrations** - Version-controlled schema changes

## 🔐 Security Considerations

1. **Authentication**: Firebase + JWT dual-layer security
2. **Authorization**: Role-based access control at endpoint level
3. **Password Security**: BCrypt hashing with salt rounds
4. **Token Rotation**: Refresh token mechanism
5. **Rate Limiting**: Protection against abuse
6. **Input Sanitization**: Validation before processing
7. **CORS**: Controlled cross-origin access
8. **Environment Variables**: Sensitive data protection

## 🤝 Contributing

This project demonstrates proficiency in:
- RESTful API design
- Database schema design and optimization
- Authentication and authorization patterns
- Cloud service integration
- Payment processing systems
- Audit and compliance tracking
- Error handling and logging
- Security best practices

## 👨‍💻 Author

**Arnav**

This project showcases expertise in:
- Backend development with Node.js and Express
- Database design with PostgreSQL and Prisma
- Authentication systems (Firebase, JWT)
- Payment processing
- Cloud integration (Cloudinary, Firebase)
- Security implementations
- API design and documentation

## 📝 License

ISC

---

**Note for Recruiters**: This project demonstrates the ability to build production-ready backend systems with proper architecture, security measures, and scalability considerations. The codebase follows industry best practices and modern development patterns.
