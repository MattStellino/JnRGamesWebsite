# J&R Games Buylist App

A modern buylist application for J&R Games featuring a public-facing item browsing interface and secure admin dashboard. Built with Next.js 15, TypeScript, PostgreSQL, and Tailwind CSS.

> Deployed on Vercel

**Technologies:** Next.js 15 · TypeScript · React 18 · PostgreSQL · Prisma ORM · NextAuth.js · Tailwind CSS · DOMPurify

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## Features

### Public Features
- Browse all gaming items with search functionality
- Filter items by category
- View item details including prices and descriptions
- Responsive design for mobile and desktop
- J&R Games branding and logo

### Admin Features
- Secure admin login with NextAuth
- Comprehensive dashboard with sidebar navigation
- CRUD operations for categories with confirmation modals
- CRUD operations for items with image preview
- Real-time search and filtering
- Toast notifications for user feedback
- Mobile-responsive admin interface
- System settings and statistics

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd buylist-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/buylist_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Formspree (Contact Form)
FORMSPREE_ENDPOINT="https://formspree.io/f/YOUR_FORM_ID"

# Admin credentials (for initial setup)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

5. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with initial admin user
npx prisma db seed
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following Prisma schema:

```prisma
model Admin {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id    Int     @id @default(autoincrement())
  name  String  @unique
  items Item[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Item {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  price       Float
  imageUrl    String?
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId  Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/[id]` - Get a specific category
- `PUT /api/categories/[id]` - Update a category
- `DELETE /api/categories/[id]` - Delete a category

### Items
- `GET /api/items` - Get all items (supports search and category filters)
- `POST /api/items` - Create a new item
- `GET /api/items/[id]` - Get a specific item
- `PUT /api/items/[id]` - Update an item
- `DELETE /api/items/[id]` - Delete an item

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:

- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - A secure random string
- `FORMSPREE_ENDPOINT` - Your Formspree form endpoint URL (default: `https://formspree.io/f/mqagvyde`)
- `ADMIN_USERNAME` - Your admin username
- `ADMIN_PASSWORD` - Your admin password (will be hashed)

## Admin Setup

After deployment, you'll need to create an admin user. You can do this by:

1. Running a script to create the admin user with hashed password
2. Or manually inserting into the database

Example script to create admin user:

```typescript
import bcrypt from 'bcryptjs'
import { prisma } from './src/lib/prisma'

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('your-password', 12)
  
  await prisma.admin.create({
    data: {
      username: 'admin',
      password: hashedPassword,
    },
  })
  
  console.log('Admin user created successfully')
}

createAdmin()
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
