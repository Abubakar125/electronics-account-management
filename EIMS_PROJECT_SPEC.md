# Electronics Installment Management System (EIMS)
## Complete Project Specification

---

## Project Overview

**Client:** Farhan Electronics
**Purpose:** Replace paper registers with a modern web application for tracking customer installment purchases.

**Problem:** Shop currently records all customer info and payment history on hand-written registers. Issues include duplicate customer entries, manual balance calculations, no search, no reports, and risk of losing records.

**Core Value:** One customer → Multiple product accounts → Full payment history → Auto balance tracking.

---

## Technology Stack

### Frontend
- Angular 20 + TypeScript
- Angular Material
- Tailwind CSS
- RxJS + Angular Signals
- Reactive Forms

### Backend
- Node.js + Express.js
- Sequelize ORM
- MySQL
- JWT Authentication + bcrypt
- Express Validator

### Deployment
- Docker + docker-compose
- PM2
- Nginx

---

## Authentication
- **Single admin only** — no registration, no user management
- JWT-based login
- bcrypt password hashing
- Angular Route Guards
- Remember Me (localStorage token)
- Logout

---

## Business Rules

1. Every customer exists **only once** (CNIC is unique identifier)
2. One customer can own **unlimited installment accounts**
3. Every account has a **unique auto-generated account number** (`ACC-YYYY-NNNNN`)
4. Searching a customer returns the **customer + all associated accounts**
5. Every payment is linked to a **specific account** (not to the customer directly)
6. **Remaining balance auto-updates** after every payment (`remaining -= amount`)
7. Account **auto-marks as Completed** when `remaining <= 0`
8. Every payment gets a **unique receipt number** (`RCP-YYYY-NNNNN`)
9. On account creation: `remaining = total_price - advance`
10. Customer code format: `CUST-NNNN`

---

## Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK AUTO_INCREMENT | |
| username | VARCHAR(100) UNIQUE | |
| password | VARCHAR(255) | bcrypt hashed |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `customers`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK AUTO_INCREMENT | |
| customer_code | VARCHAR(20) UNIQUE | Auto: CUST-0001 |
| name | VARCHAR(150) | |
| father_name | VARCHAR(150) | |
| cnic | VARCHAR(20) UNIQUE | |
| phone1 | VARCHAR(20) | |
| phone2 | VARCHAR(20) | |
| address | TEXT | |
| occupation | VARCHAR(100) | |
| reference | VARCHAR(150) | |
| photo | VARCHAR(255) | file path |
| cnic_front | VARCHAR(255) | file path |
| cnic_back | VARCHAR(255) | file path |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `accounts`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK AUTO_INCREMENT | |
| account_number | VARCHAR(20) UNIQUE | Auto: ACC-2026-00001 |
| customer_id | INT FK | → customers.id |
| product_name | VARCHAR(150) | |
| brand | VARCHAR(100) | |
| model | VARCHAR(100) | |
| total_price | DECIMAL(12,2) | |
| advance | DECIMAL(12,2) | |
| remaining | DECIMAL(12,2) | Auto-calculated |
| monthly_installment | DECIMAL(12,2) | |
| duration | INT | months |
| purchase_date | DATE | |
| due_date | DATE | next installment due |
| status | ENUM | active/completed/cancelled/overdue |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `payments`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK AUTO_INCREMENT | |
| receipt_no | VARCHAR(20) UNIQUE | Auto: RCP-2026-00001 |
| account_id | INT FK | → accounts.id |
| payment_date | DATE | |
| amount | DECIMAL(12,2) | |
| remaining_balance | DECIMAL(12,2) | balance after payment |
| remarks | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### Relationships
```
Customer (1) ──── (∞) Accounts (1) ──── (∞) Payments
```

---

## Modules

### 1. Login
- Glassmorphism card UI
- Username + Password + Remember Me
- JWT auth, bcrypt, route guards

### 2. Dashboard
**Cards:** Total Customers, Active Accounts, Completed Accounts, Outstanding Amount, Today's Collection, Monthly Collection
**Lists:** Recent Customers (5), Recent Payments (5), Upcoming Due Accounts (7 days)

### 3. Customers
**Fields:** Customer Code, Name, Father Name, CNIC, Phone 1, Phone 2, Address, Occupation, Reference, Photo, CNIC Front, CNIC Back
**Features:** Add, Edit, Delete (confirm dialog), View Profile, Search (name/CNIC/phone), Timeline

**Customer Profile Page:**
- Header: photo + name + CNIC + mobile + address
- Summary: accounts count, active, completed, total paid, outstanding
- Accounts list with status badges
- Activity timeline

### 4. Accounts
**Fields:** Account Number, Customer, Product Name, Brand, Model, Total Price, Advance, Remaining, Monthly Installment, Duration, Purchase Date, Due Date, Status
**Status values:** active | completed | cancelled | overdue

**Account Detail Page:**
- Customer info summary
- Purchase info card
- Progress bar (% paid)
- Payment history table
- Add Payment button

### 5. Payments
**Fields:** Receipt No, Account, Payment Date, Amount Paid, Remaining Balance, Remarks
**Features:** Record payment, Print receipt, Export PDF/Excel

### 6. Reports
**Types:** Daily/Weekly/Monthly/Yearly Collection, Customer Report, Outstanding Report, Completed Accounts Report
**Features:** Date range filter, Export PDF, Export Excel, Print

### 7. Settings
- Company Name, Logo, Phone, Address, Currency, Receipt Footer

---

## Angular Folder Structure

```
src/app/
├── core/
│   ├── guards/auth.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   └── services/auth.service.ts
├── shared/
│   └── components/
│       ├── confirm-dialog/   (html + scss + ts)
│       ├── skeleton-loader/  (html + scss + ts)
│       ├── empty-state/      (html + scss + ts)
│       ├── stats-card/       (html + scss + ts)
│       └── data-table/       (html + scss + ts)
├── layout/
│   ├── main-layout/          (html + scss + ts)
│   ├── sidebar/              (html + scss + ts)
│   └── navbar/               (html + scss + ts)
├── models/
│   ├── customer.model.ts
│   ├── account.model.ts
│   ├── payment.model.ts
│   └── user.model.ts
├── services/
│   ├── customer.service.ts
│   ├── account.service.ts
│   ├── payment.service.ts
│   ├── report.service.ts
│   └── settings.service.ts
└── pages/
    ├── login/                (html + scss + ts)
    ├── dashboard/            (html + scss + ts)
    ├── customers/
    │   ├── customer-list/    (html + scss + ts)
    │   ├── customer-detail/  (html + scss + ts)
    │   └── customer-form/    (html + scss + ts)
    ├── accounts/
    │   ├── account-list/     (html + scss + ts)
    │   ├── account-detail/   (html + scss + ts)
    │   └── account-form/     (html + scss + ts)
    ├── payments/
    │   ├── payment-list/     (html + scss + ts)
    │   └── payment-form/     (html + scss + ts)
    ├── reports/              (html + scss + ts)
    └── settings/             (html + scss + ts)
```

**MANDATORY:** Every component = exactly 3 files (.html, .scss, .ts). No inline templates/styles.

---

## Backend Folder Structure

```
backend/
└── src/
    ├── config/       (database.js, env.js)
    ├── controllers/  (auth, customer, account, payment, report, settings)
    ├── middlewares/  (auth.middleware.js, error.middleware.js)
    ├── models/       (index.js + all Sequelize models)
    ├── routes/       (all route files)
    ├── services/     (business logic layer)
    ├── validators/   (Express Validator rules)
    ├── utils/        (codeGenerator, pdfGenerator, excelGenerator)
    ├── database/     (migrations/, seeders/)
    └── uploads/      (customer photos, CNIC images)
```

---

## UI/UX Design System

| Element | Spec |
|---------|------|
| Background | #F8FAFC (very light gray) |
| Surface | #FFFFFF (white cards) |
| Primary | Blue (Angular Material) |
| Success/Active | Emerald green |
| Warning/Overdue | Amber |
| Danger | Red |
| Cancelled | Gray |
| Border radius | 12px |
| Shadow | Soft, subtle |
| Font | Inter or Roboto |

**Components required:**
- Glassmorphism login page
- Animated stats cards with hover lift
- Tables: sticky header, pagination, sorting, search, filter chips
- Skeleton loaders on page load
- Empty state illustrations
- Confirmation dialogs before delete
- Toast notifications (top-right)
- Progress bar on account detail
- Status badges as colored pills
- Dark mode (persisted in localStorage)
- Mobile-first responsive (sidebar collapses on mobile)

---

## API Endpoints (REST)

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Customers
- `GET /api/customers` (with search query)
- `GET /api/customers/:id`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id`
- `GET /api/customers/:id/accounts`
- `GET /api/customers/:id/timeline`

### Accounts
- `GET /api/accounts`
- `GET /api/accounts/:id`
- `POST /api/accounts`
- `PUT /api/accounts/:id`
- `DELETE /api/accounts/:id`
- `GET /api/accounts/:id/payments`

### Payments
- `GET /api/payments`
- `GET /api/payments/:id`
- `POST /api/payments`
- `GET /api/payments/:id/receipt` (PDF)

### Reports
- `GET /api/reports/collection?period=daily|weekly|monthly|yearly&from=&to=`
- `GET /api/reports/outstanding`
- `GET /api/reports/completed`
- `GET /api/reports/customers`

### Settings
- `GET /api/settings`
- `PUT /api/settings`

---

## Deliverables Checklist

- [ ] MySQL schema SQL file
- [ ] Sequelize models with associations
- [ ] All REST APIs with error handling
- [ ] Complete Angular frontend (lazy-loaded modules)
- [ ] All shared/reusable components
- [ ] JWT authentication + route guards
- [ ] Seed data (admin user + sample data)
- [ ] Docker + docker-compose configuration
- [ ] `.env.example` file
- [ ] README with complete setup instructions
