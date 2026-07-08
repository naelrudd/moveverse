# Moveverse - School Management System

## Overview

Moveverse adalah platform gamifikasi gerak motorik untuk anak Indonesia. Sistem ini memiliki multi-role (admin, school_admin, teacher, student, parent) dengan fitur monitoring sekolah, manajemen kelas, dan tracking progress siswa.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    MOVEVERSE                         │
├─────────────────────────────────────────────────────┤
│  Frontend: Next.js 15 + Tailwind CSS                │
│  Backend:  Convex (real-time database)              │
│  Auth:     Clerk (email/password)                   │
├─────────────────────────────────────────────────────┤
│  Roles:                                             │
│  ├── admin (dev) - Full access, manages schools     │
│  ├── school_admin - Monitors all users in school    │
│  ├── teacher - Creates classes, manages students    │
│  ├── student - Joins classes, tracks progress       │
│  └── parent - Links to child, monitors progress     │
└─────────────────────────────────────────────────────┘
```

## User Flow

### 1. School Registration (Admin)
1. User contacts admin via email (natanaelrudyhadinata@gmail.com)
2. Admin creates school with NPSN in `/admin` → Schools tab
3. School is now available in sign-up dropdown

### 2. Sign-up Flow
1. User goes to `/sign-up`
2. Creates Clerk account (email + password)
3. Redirected to `/onboarding`
4. Selects role (student/parent/teacher)

### 3. Onboarding Flow

#### Student
1. Select school from dropdown
2. Enter NIS (Nomor Induk Siswa)
3. Enter class code (from teacher)
4. Confirm → Dashboard

#### Teacher
1. Select school from dropdown
2. Enter phone number
3. Confirm → Teacher Dashboard (can create classes)

#### Parent
1. Enter child's unique code (8 characters)
2. System links to child's account
3. Confirm → Parent Dashboard

### 4. Class Management
- **Teacher creates class** → System generates unique 6-char code
- **Teacher shares code** with students
- **Student enters code** during onboarding or from dashboard

## Database Schema

### Tables

#### `schools`
```typescript
{
  name: string,        // "SDN Sawojajar 1"
  slug: string,        // "sdn-sawojajar-1"
  npsn: string,        // "20533811" (optional)
  address?: string,    // "Malang"
}
```

#### `classes`
```typescript
{
  schoolId: Id<"schools">,
  name: string,        // "1A"
  grade: number,       // 1
  code?: string,       // "A1B2C3" (auto-generated 6-char)
}
```

#### `users`
```typescript
{
  clerkId: string,     // Clerk auth ID
  name: string,
  nis?: string,        // Student ID (school-specific)
  childCode?: string,  // Unique 8-char code (student only)
  phone?: string,      // For teachers/parents
  avatar: string,      // Emoji
  xp: number,
  coins: number,
  level: number,
  role?: "student" | "parent" | "teacher" | "admin" | "school_admin",
  schoolId?: Id<"schools">,
  classId?: Id<"classes">,
  childIds?: Id<"users">[],  // Parent's linked children
  parentIds?: Id<"users">[], // Student's linked parents
}
```

#### `activity_logs`
```typescript
{
  userId: Id<"users">,
  action: string,      // "login", "quest_complete", "class_join"
  details?: string,
  metadata?: Record<string, string>,
  timestamp: number,
}
```

## API Endpoints

### Convex Queries
- `users.getUser(clerkId)` - Get user by Clerk ID
- `users.getUserById(userId)` - Get user by ID
- `users.lookupByChildCode(childCode)` - Lookup student by child code
- `schools.getSchool(schoolId)` - Get school
- `schools.lookupByNpsn(npsn)` - Lookup school by NPSN
- `schools.getAllSchools` - List all schools
- `classes.getClassesBySchool(schoolId)` - List classes in school
- `classes.getClassByCode(code)` - Lookup class by code
- `admin.getAdminStats(schoolId)` - School statistics
- `admin.getGlobalStats` - Global statistics (dev admin)
- `admin.getAllUsers` - All users (dev admin)
- `admin.getUsersBySchool(schoolId)` - Users in school
- `admin.getLogsBySchool(schoolId)` - Activity logs

### Convex Mutations
- `users.createUser(...)` - Create new user (auto-generates childCode for students)
- `users.claimAccount(clerkId, identifier, role)` - Link Clerk account to existing user
- `classes.createClass(schoolId, name, grade)` - Create class (auto-generates code)
- `classes.joinClassByCode(userId, code)` - Student joins class
- `classes.linkChildByNis(parentId, childNis)` - Parent links to child
- `classes.regenerateCode(classId)` - Regenerate class code
- `admin.createSchool(name, slug, npsn)` - Create school
- `admin.createSchoolAdmin(...)` - Create school admin account
- `admin.createUser(...)` - Create user (admin only)
- `admin.updateUser(...)` - Update user
- `admin.deleteUser(userId)` - Delete user
- `seed.seedAll` - Initial seed (schools + classes)
- `seed.fixClassCodes` - Add codes to existing classes
- `seed.fixNpsn` - Add NPSN to existing schools

## Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/sign-in` | Sign in | Public |
| `/sign-up` | Sign up | Public |
| `/onboarding` | Complete profile | Authenticated |
| `/admin` | Admin dashboard | admin, school_admin |
| `/school` | School dashboard | All roles (school-specific) |
| `/teacher` | Teacher dashboard | teacher |
| `/dashboard/student` | Student dashboard | student |
| `/parent` | Parent dashboard | parent |
| `/worlds` | Gamification worlds | All roles |

## Environment Setup

### Local Development
```bash
# Install dependencies
npm install

# Start Convex (real-time backend)
npx convex dev

# Start Next.js (in another terminal)
npm run dev
```

### Production Deploy
```bash
# Deploy Convex functions
npx convex deploy

# Build Next.js
npm run build

# Deploy to Vercel
vercel deploy
```

## Seed Data

### Initial Seed
```bash
npx convex run seed:seedAll
```
Creates:
- 3 schools (SDN Sawojajar 1, SDN Lowokwaru 1, SDN Blimbing 1)
- 6 classes per school (1A-6B) with unique codes

### Fix Existing Data
```bash
# Add codes to classes without codes
npx convex run seed:fixClassCodes

# Add NPSN to schools without NPSN
npx convex run seed:fixNpsn
```

## Key Features

### For Students
- Track XP, coins, levels
- Complete daily quests
- Join classes via code
- View leaderboard

### For Teachers
- Create and manage classes
- View class statistics
- Share class codes with students

### For Parents
- Link to child via child code
- Monitor child's progress
- View activity logs

### For School Admin
- Monitor all users in school
- View usage statistics
- View activity logs

### For Dev Admin
- Manage all schools
- Create school admin accounts
- Global statistics
- Full CRUD on users

## Security Notes

- NPSN is not exposed in sign-up (prevents abuse)
- Child codes are unique 8-character strings
- Class codes are unique 6-character strings
- Role-based access control on all pages
- Activity logging for audit trail

## Contact

For school registration or support:
- Email: natanaelrudyhadinata@gmail.com
