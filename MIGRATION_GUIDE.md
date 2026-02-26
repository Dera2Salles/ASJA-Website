# ASJA Website — Migration Guide

## What's New in This Update

### 1. ✅ Inertia.js Migration Complete

All JS resources are now fully integrated with Laravel Inertia.js.

**What changed:**
- `resources/js/routes/index.tsx` — Router removed (was using react-router-dom, now Inertia handles routing)
- `resources/js/app.tsx` — Already configured for Inertia
- All pages under `resources/js/Pages/` render via Inertia

**New pages:**
- `Pages/Blog/Index.tsx` — Public blog listing page
- `Pages/Departments/Show.tsx` — Dynamic department page (replaces static pages)

---

### 2. ✅ Admin Component Data Sections

Every landing page section is now controllable from the admin:

**URL:** `/admin/component-data`

Sections: `hero`, `about`, `contact`, `stats`, `programs`, `gallery`, `blog`

**How it works:**
- Data is stored in the `component_data` table (section + key + value)
- Admin edits text fields through the dashboard
- LandingPage receives `componentData` prop via Inertia

---

### 3. ✅ Student Manager Migration (Database + Inertia)

**New migration:** `2026_02_26_000002_make_email_nullable_on_users.php`
- Makes `email` nullable (students may not have email)
- Adds `avatar` column

**Updated StudentController:**
- Now returns Inertia responses (not JSON)
- Proper pagination, search, filter by mention

**New page:** `Pages/Admin/Students/Index.tsx`
- Full CRUD with pagination
- Filter by mention, level, search

---

### 4. ✅ Blog Editor Integrated

The `BlogEditor` TipTap-based editor is now used in both Create and Edit pages.

**Admin pages:**
- `/admin/blog` — List all posts
- `/admin/blog/create` — Create with BlogEditor
- `/admin/blog/{id}/edit` — Edit with BlogEditor

**Public pages:**
- `/blog` — Blog listing page (new)
- `/blog/{slug}` — Single post page (existing)

The blog section also appears on the landing page (`BlogSection` component).

---

### 5. ✅ Department Pages + Admin Management

**Database:**
- `departments` table — name, slug, description, logo, hero_image, color, is_visible
- `department_programs` table — title, description, competences, debouches

**Admin routes:**
- `/admin/departments` — List departments
- `/admin/departments/create` — Create new
- `/admin/departments/{id}/edit` — Edit + manage programs

**Public routes:**
- `/mention/{slug}` — Dynamic department page

All old static department pages (`/page/Info/`, `/page/Droit/`, etc.) are now replaced by the dynamic `Departments/Show.tsx` page.

---

## Setup Instructions

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. Seed Initial Data
```bash
php artisan db:seed
```

This seeds:
- Default `component_data` values for all landing sections
- All 6 departments with sample programs

### 3. Build Frontend
```bash
npm install
npm run build
# or for dev:
npm run dev
```

### 4. Create Admin User
```bash
php artisan tinker
>>> App\Models\User::create(['name' => 'Admin', 'email' => 'admin@asja.mg', 'password' => bcrypt('password'), 'role' => 'Admin']);
```

---

## File Structure Changes

```
resources/js/
├── Pages/
│   ├── Admin/
│   │   ├── Blog/
│   │   │   ├── Create.tsx     ← NEW: uses BlogEditor
│   │   │   ├── Edit.tsx       ← NEW: uses BlogEditor
│   │   │   └── Index.tsx      (existing)
│   │   ├── Departments/
│   │   │   ├── Index.tsx      ← NEW
│   │   │   ├── Create.tsx     ← NEW
│   │   │   ├── Edit.tsx       ← NEW
│   │   │   └── DepartmentForm.tsx ← NEW (shared form)
│   │   ├── Students/
│   │   │   └── Index.tsx      ← NEW (Inertia-based)
│   │   ├── Testimonies/Index.tsx (existing)
│   │   └── ComponentData/Index.tsx (existing)
│   ├── Blog/
│   │   └── Index.tsx          ← NEW (public blog list)
│   ├── Departments/
│   │   └── Show.tsx           ← NEW (dynamic dept page)
│   └── Layouts/
│       └── AdminLayout.tsx    ← UPDATED (added Students + Departments nav)
│
app/
├── Http/Controllers/
│   ├── DepartmentController.php    ← NEW
│   ├── LandingPageController.php   ← UPDATED
│   └── Admin/
│       ├── DepartmentController.php ← NEW
│       └── StudentController.php   ← UPDATED
├── Models/
│   ├── Department.php              ← NEW
│   └── DepartmentProgram.php       ← NEW
│
database/
├── migrations/
│   ├── 2026_02_26_000001_create_departments_table.php ← NEW
│   └── 2026_02_26_000002_make_email_nullable_on_users.php ← NEW
└── seeders/
    ├── DepartmentSeeder.php        ← NEW
    └── DatabaseSeeder.php          ← UPDATED
```

---

## Admin Navigation

| Section | URL | Description |
|---------|-----|-------------|
| Témoignages | /admin/testimonies | Manage testimonials |
| Contenu du site | /admin/component-data | Edit landing page text |
| Blog / Actualités | /admin/blog | Manage blog posts |
| Étudiants | /admin/students | Student manager |
| Départements | /admin/departments | Manage departments & programs |

