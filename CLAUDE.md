# EIMS — Claude Code Instructions

This file is automatically loaded by Claude Code at the start of every session. It contains everything Claude needs to build this project correctly without re-reading the full spec.

---

## Project
**Electronics Installment Management System (EIMS)** for Farhan Electronics.
Full spec: `EIMS_PROJECT_SPEC.md`

---

## Stack
- **Frontend:** Angular 20, TypeScript, Angular Material, Tailwind CSS, RxJS, Angular Signals, Reactive Forms
- **Backend:** Node.js, Express.js, Sequelize ORM, MySQL, JWT, bcrypt, Express Validator
- **Deploy:** Docker, PM2, Nginx

---

## Non-negotiable rules

### Angular Components
Every component MUST have exactly 3 separate files:
```
component-name.component.html
component-name.component.scss
component-name.component.ts
```
**Never** use inline templates or inline styles.

### Authentication
Single admin only. No user management module. No roles. No registration.

### Removed items (do NOT add these back)
- Chart.js
- Multer (use a different file upload approach)
- Role-based access control
- Product inventory module
- Notifications module
- User management module
- IMEI/Serial Number field

### Business logic (must be enforced server-side)
- `remaining = total_price - advance` (set at account creation)
- After each payment: `remaining -= payment.amount`
- If `remaining <= 0`: set `status = 'completed'`
- Auto-generate: `account_number = ACC-YYYY-NNNNN`, `receipt_no = RCP-YYYY-NNNNN`, `customer_code = CUST-NNNN`
- CNIC is the unique identifier for customer deduplication

---

## Project structure
```
D:\projects\Farhan-Electronics\
├── frontend/          ← Angular 20 app
├── backend/           ← Node.js + Express API
├── docker-compose.yml
├── CLAUDE.md          ← this file
└── EIMS_PROJECT_SPEC.md  ← full specification
```

---

## Current build status
- [ ] Project not yet started
- [ ] Backend setup
- [ ] Frontend setup
- [ ] Authentication
- [ ] Customer module
- [ ] Accounts module
- [ ] Payments module
- [ ] Reports module
- [ ] Settings module
- [ ] Docker configuration
- [ ] Seed data
