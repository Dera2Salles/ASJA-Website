<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

-   **Framework:** [React](https://react.dev/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)

## 📂 Project Structure

The project follows a feature-based and layered architecture, promoting separation of concerns and maintainability.

```
/src
├── App.tsx
├── main.tsx
├── routes/
│   └── index.tsx
├── components/
│   ├── ui/
│   └── hooks/
├── core/
│   ├── constant.ts
│   ├── result.ts
│   └── types.ts
├── features/
│   ├── auth/
│   │   ├── auth.repository.ts
│   │   ├── auth.repository.impl.ts
│   │   ├── auth.service.ts
│   │   └── login.dto.ts
│   ├── admin/
│   ├── user/
│   └── ... (other features)
├── page/
│   ├── landing/
│   │   ├── components/
│   │   ├── bloc/
│   │   └── index.tsx
│   ├── admin/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── bloc/
│   │   └── index.tsx
│   ├── student-space/
│   └── ... (other pages)
├── lib/
│   └── utils.ts
└── i18n.ts
```

### Core Directories

-   **`src/components`**: Contains reusable UI components.
    -   `ui/`: Dumb, presentational components, mostly from `shadcn/ui`.
    -   `hooks/`: Reusable custom hooks.
-   **`src/core`**: Holds the core logic and definitions of the application.
    -   `types.ts`: Global TypeScript types and enums (`Mention`, `Level`, `Role`, etc.).
    -   `constant.ts`: Application-wide constants like API endpoints.
    -   `result.ts`: A generic `Result` type for handling success/failure states in asynchronous operations, inspired by functional programming.
-   **`src/features`**: Organizes code by domain or feature (e.g., `auth`, `user`, `post`). This is the heart of the application's business logic. Each feature folder typically contains:
    -   **DTOs (`.dto.ts`)**: Data Transfer Objects define the shape of data exchanged with the API.
    -   **Entities (`.entity.ts`)**: Represent the core domain models.
    -   **Repository (`.repository.ts` and `.repository.impl.ts`)**: The repository pattern abstracts the data layer. The `.ts` file is the interface, and the `.impl.ts` file provides the concrete implementation, handling data fetching, mapping, and error handling.
    -   **Service (`.service.ts`)**: The service layer communicates with the API (e.g., using `axios`). It's injected into the repository implementation.
-   **`src/page`**: Contains the main pages of the application, which are composed of components and connected to the business logic from the `features` directory. Each page often has its own state management (`bloc` folder with custom hooks) and components.
    -   `landing/`: The public-facing homepage.
    -   `admin/`: The administration dashboard.
    -   `student-space/`: The portal for logged-in students.
    -   `login/`: The authentication page.
-   **`src/routes`**: Defines the application's routing using `react-router-dom`.
-   **`src/lib`**: Utility functions, like the `cn` function for merging Tailwind CSS classes.
-   **`src/i18n.ts`**: Configuration for internationalization (i18n) using `i18next`.

### Architectural Patterns

-   **Layered Architecture**: The code is structured into distinct layers (UI, BLoC, Repository, Service) to separate concerns.
-   **Repository Pattern**: The `features` directories use repositories to abstract data sources. This makes it easy to swap data implementations without affecting the UI. For example, you could switch from a REST API to a local mock data source by just changing the repository implementation.
-   **Dependency Injection**: Services are "injected" into repositories (see `src/injection.ts`), and repositories are used by the UI hooks (`bloc`). This promotes loose coupling.
-   **BLoC (Business Logic Component)**: The `bloc` folders inside page directories contain custom hooks that manage the page's state and business logic. They interact with repositories to fetch and manipulate data, providing a clean API to the UI components. This is a form of Presenter/ViewModel pattern.
-   **Feature-Sliced Design**: Code is organized by features, making the codebase scalable and easy to navigate.

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
