# 🏗️ Enterprise Framework Core

A modern, production-ready Next.js framework for building enterprise applications with comprehensive user management, role-based access control, workflow automation, and organizational hierarchy.

## 🎯 Framework Vision

This framework provides the **core infrastructure** that every enterprise application needs:
- **No domain-specific logic** - Pure reusable foundation
- **Plugin architecture ready** - Easy to extend with domain modules
- **Production-tested** - Battle-tested patterns and best practices
- **Type-safe** - Full TypeScript support throughout

---

## 🚀 Core Features

### 🔐 Authentication & Authorization
- **NextAuth.js** integration with JWT sessions
- **Multi-role system** with granular permissions
- Context-based roles (Global, Company, Branch, Department)
- Time-limited role assignments
- Menu-based access control
- Veto authority support

### 🏢 Organization Management
- **Hierarchical structure**: Company → Branch → Department → User
- Position/title management
- Manager relationships
- Cost center tracking
- Soft delete support

### 👥 Teams & Groups
- **Permanent teams** within departments
- **Cross-functional groups** (committees, projects)
- Role-based membership (Owner, Admin, Lead, Member)
- Visibility controls (Public, Private, Restricted)

### ⚙️ Workflow Engine
- **Generic workflow system** for any approval process
- Visual workflow designer
- Step-based assignments (role/user/auto)
- Deadline tracking & escalation
- Delegation system (yetki devri)
- Veto authority
- Complete audit trail

### 📊 Custom Fields System
- **Dynamic field definitions** per entity
- Field types: text, number, select, date, file, etc.
- Validation rules (JSON-based)
- Grouping by sections
- Field ordering

### 🔔 Notification System
- Multi-channel notifications (in-app, email, SMS ready)
- Priority levels
- Category-based filtering
- Read/unread tracking

### 👔 HR Integration
- CSV import
- LDAP/Active Directory sync (ready)
- REST API integration (ready)
- Automated employee sync
- Org chart synchronization

### 🎨 UI/UX Components
- **Shadcn UI** + **Radix UI** components
- **Tailwind CSS** for styling
- Dark mode support
- Responsive design (mobile-first)
- Data tables with sorting, filtering, pagination
- Form components with validation
- Date range pickers
- File uploads (via UploadThing)

---

## 📦 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** with Server Components
- **TypeScript** (strict mode)
- **Tailwind CSS** + **Shadcn UI**
- **React Hook Form** + **Zod** validation
- **use-intl** for i18n (TR/EN)

### Backend
- **Drizzle ORM** (type-safe SQL)
- **PostgreSQL** database
- **NextAuth.js** for authentication
- **Server Actions** for mutations
- **API Routes** for REST endpoints

### DevOps
- **Docker** & **Docker Compose**
- **pnpm** for package management
- **ESLint** + **Prettier** for code quality
- **Git** for version control

---

## 📂 Project Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication pages (login, signup)
│   ├── (main)/           # Main app layout
│   │   ├── admin/        # Admin pages (users, roles, org, workflows)
│   │   ├── settings/     # User settings
│   │   └── system/       # System configuration
│   └── api/              # API routes
│       ├── auth/         # NextAuth endpoints
│       ├── users/        # User management API
│       ├── roles/        # Role management API
│       ├── companies/    # Company API
│       ├── branches/     # Branch API
│       ├── departments/  # Department API
│       └── ...
├── components/
│   ├── admin/            # Admin UI components
│   ├── layout/           # Layout components (header, sidebar, etc.)
│   ├── ui/               # Shadcn UI primitives
│   ├── workflow-designer/ # Visual workflow builder
│   └── ...
├── config/
│   ├── auth.ts           # NextAuth configuration
│   ├── routes.ts         # Route definitions
│   └── data-table.ts     # Data table config
├── drizzle/
│   ├── schema/
│   │   ├── auth.ts       # Auth tables (Account, Session, VerificationToken)
│   │   ├── user.ts       # User table
│   │   ├── role-system.ts # Roles, Permissions, UserRoles
│   │   ├── organization.ts # Companies, Branches, Departments, Positions
│   │   ├── teams-groups.ts # Teams, Groups, Memberships
│   │   ├── menu.ts       # Dynamic menu system
│   │   ├── workflow.ts   # Workflow engine
│   │   ├── workflow-definition.ts # Workflow templates
│   │   ├── custom-field.ts # Custom fields
│   │   ├── hr-sync.ts    # HR integration
│   │   ├── notification.ts # Notifications
│   │   └── enum.ts       # Core enums
│   └── db.ts             # Database connection
├── lib/
│   ├── actions/          # Server Actions
│   ├── queries/          # Database queries
│   └── utils.ts          # Utility functions
└── i18n/
    ├── locales/
    │   ├── en/           # English translations
    │   └── tr/           # Turkish translations
    └── request.ts        # i18n configuration
```

---

## 🗄️ Database Schema

### Core Tables

#### **Authentication**
- `User` - User accounts
- `Account` - OAuth accounts (Google, GitHub, etc.)
- `Session` - User sessions
- `VerificationToken` - Email verification

#### **Authorization**
- `Roles` - Role definitions
- `UserRoles` - User-Role assignments (many-to-many)
- `Permissions` - Granular permissions
- `RolePermissions` - Role-Permission mapping
- `RoleMenus` - Role-Menu access

#### **Organization**
- `Company` - Top-level organizations
- `Branch` - Physical locations/regional offices
- `Department` - Organizational departments (nested)
- `Position` - Job titles/career levels

#### **Collaboration**
- `Team` - Permanent organizational teams
- `Group` - Cross-functional groups
- `TeamMember` - Team membership
- `GroupMember` - Group membership

#### **Workflow**
- `WorkflowDefinition` - Workflow templates
- `WorkflowInstance` - Active workflow instances
- `StepAssignment` - Step assignments
- `WorkflowDelegation` - Delegation records
- `WorkflowTimeline` - Audit trail

#### **Infrastructure**
- `Menu` - Dynamic navigation menus
- `CustomFieldDefinition` - Custom field schemas
- `CustomFieldValue` - Custom field values
- `Notification` - User notifications
- `HRSyncLog` - HR integration logs

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ (20+ recommended)
- PostgreSQL 15+
- pnpm 8+
- Docker (optional, for containerized development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/enterprise-framework.git
   cd enterprise-framework
   git checkout framework-core
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # UploadThing (for file uploads)
   UPLOADTHING_SECRET="your-uploadthing-secret"
   UPLOADTHING_APP_ID="your-uploadthing-app-id"
   ```

4. **Run database migrations**
   ```bash
   pnpm db:push
   ```

5. **Seed initial data** (optional)
   ```bash
   pnpm db:seed
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

### Docker Setup (Alternative)

```bash
# Start PostgreSQL + App
docker-compose up -d

# Run migrations
docker-compose exec app pnpm db:push

# View logs
docker-compose logs -f app
```

---

## 🎨 Customization Guide

### Adding a New Domain Module

1. **Create schema file**
   ```typescript
   // src/drizzle/schema/your-module.ts
   import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
   
   export const yourEntity = pgTable("YourEntity", {
     id: uuid("id").defaultRandom().primaryKey(),
     name: varchar("name", { length: 255 }).notNull(),
     createdAt: timestamp("createdAt").defaultNow().notNull(),
   });
   ```

2. **Export from index**
   ```typescript
   // src/drizzle/schema/index.ts
   export * from "./your-module";
   ```

3. **Create API routes**
   ```typescript
   // src/app/api/your-module/route.ts
   export async function GET() {
     const items = await db.query.yourEntity.findMany();
     return NextResponse.json(items);
   }
   ```

4. **Create pages**
   ```typescript
   // src/app/(main)/your-module/page.tsx
   export default async function YourModulePage() {
     // Your implementation
   }
   ```

### Extending Workflow Engine

The workflow engine is designed to work with any entity:

```typescript
// Define entity type
export const entityType = pgEnum("EntityType", [
  "Audit",    // Example
  "Invoice",  // Your domain
  "Request",  // Your domain
]);

// Create workflow definition
await db.insert(workflowDefinitions).values({
  name: "Invoice Approval",
  entityType: "Invoice",
  steps: [...],
  transitions: [...],
});
```

### Adding Custom Fields

Custom fields work with any entity:

```typescript
// Define custom field
await db.insert(customFieldDefinitions).values({
  entityType: "Invoice",
  fieldKey: "invoiceNumber",
  fieldType: "text",
  label: "Invoice Number",
  required: true,
});
```

---

## 🔒 Security

### Authentication
- JWT-based session management
- Secure password hashing (bcrypt)
- Email verification
- OAuth providers (Google ready, others easy to add)

### Authorization
- Role-based access control (RBAC)
- Permission-based guards
- Menu-based navigation control
- Context-aware permissions (company, branch, department)

### Best Practices
- Environment variables for secrets
- SQL injection prevention (Drizzle ORM)
- XSS protection (React escaping)
- CSRF protection (NextAuth)
- Rate limiting ready (middleware)

---

## 📚 API Documentation

### User Management

#### Get Users
```http
GET /api/users?page=1&limit=10&search=john
```

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "companyId": "uuid",
  "roleId": "uuid"
}
```

#### Update User
```http
PATCH /api/users/[id]
Content-Type: application/json

{
  "name": "John Smith",
  "departmentId": "uuid"
}
```

### Role Management

#### Get Roles
```http
GET /api/roles
```

#### Assign Role to User
```http
POST /api/roles/assign
Content-Type: application/json

{
  "userId": "uuid",
  "roleId": "uuid",
  "contextType": "Department",
  "contextId": "uuid"
}
```

---

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run type check
pnpm type-check

# Run linter
pnpm lint
```

---

## 📈 Performance

### Optimizations
- **Server Components** by default
- **Streaming** for slow data fetching
- **Partial Prerendering** ready
- **Image optimization** (Next.js Image)
- **Code splitting** automatic
- **Database indexes** on foreign keys
- **Connection pooling** (Drizzle)

### Monitoring Ready
- Error boundaries
- Logging infrastructure
- Performance metrics hooks
- Database query logging

---

## 🌍 Internationalization (i18n)

### Supported Languages
- English (en)
- Turkish (tr)

### Adding a New Language

1. **Create locale folder**
   ```bash
   mkdir -p src/i18n/locales/fr
   ```

2. **Add translations**
   ```json
   // src/i18n/locales/fr/common.json
   {
     "welcome": "Bienvenue",
     "logout": "Déconnexion"
   }
   ```

3. **Update config**
   ```typescript
   // src/i18n/request.ts
   export const locales = ['en', 'tr', 'fr'] as const;
   ```

---

## 🤝 Contributing

We welcome contributions! This framework is designed to be:
- **Modular** - Easy to extend
- **Well-documented** - Clear code and comments
- **Type-safe** - Full TypeScript coverage
- **Tested** - Unit and E2E tests

### Development Workflow
1. Create a feature branch from `framework-core`
2. Make your changes
3. Add tests
4. Update documentation
5. Submit a pull request

---

## 📄 License

MIT License - feel free to use this framework for commercial and personal projects.

---

## 🛠️ Roadmap

### Phase 1: Core Stabilization ✅
- [x] Remove domain-specific code
- [x] Clean schema structure
- [x] Document core modules
- [x] Create framework README

### Phase 2: Enhanced Core Features 🚧
- [ ] Document Management System
- [ ] Comment/Discussion System
- [ ] Attachment System
- [ ] Activity Log System
- [ ] System Settings Module
- [ ] Tag System

### Phase 3: Developer Experience 📋
- [ ] CLI for scaffolding
- [ ] Starter templates
- [ ] Code generators
- [ ] Testing utilities
- [ ] Deployment guides

### Phase 4: Advanced Features 🔮
- [ ] Multi-tenancy support
- [ ] Real-time collaboration
- [ ] Advanced reporting
- [ ] API documentation UI
- [ ] Plugin marketplace

---

## 💡 Use Cases

This framework is perfect for:
- **Enterprise Resource Planning (ERP)** systems
- **Customer Relationship Management (CRM)** tools
- **Human Resources Management** systems
- **Project Management** platforms
- **Quality Management** systems
- **Audit & Compliance** applications
- **Supply Chain Management** systems
- **Document Management** systems
- Any application requiring user management, workflows, and organizational structure

---

## 📞 Support

- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues]
- **Discussions**: [GitHub Discussions]
- **Email**: support@example.com

---

## 🌟 Credits

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Shadcn UI](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React Hook Form](https://react-hook-form.com/) - Form management
- [Zod](https://zod.dev/) - Schema validation

---

## 🎯 Quick Links

- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Customization Guide](#-customization-guide)
- [Roadmap](#-roadmap)

---

**Built with ❤️ for the enterprise community**
