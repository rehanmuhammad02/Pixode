# Pixode

One Laravel 12 project with the website and dashboard in the same application.

- app/: controllers, middleware, models and services.
- resources/js/studio/: React website, authentication and dashboard.
- resources/views/: Blade application shell.
- resources/scripts/: development and browser verification tools.
- public/assets/: website images and background film.
- routes/: website, API and console routes.
- database/: migrations, initial content and the preserved previous SQLite database.
- storage/app/public/uploads/: uploaded images.
- storage/app/private/migration-source/: preserved source database, keys and backups. Never publish this directory.

Run from C:/pixode: npm start. Open http://localhost:3000 and /admin.
Development: npm run dev, then open http://localhost:3000.
Validation: npm run check.

Fresh setup: composer install, npm install, copy .env.example to .env, php artisan key:generate, php artisan migrate, php artisan pixode:import, npm run build.
Create the initial owner with php artisan pixode:owner your@email.com (password is prompted privately).

Configure database, SMTP and Google OAuth in the root .env. Google callback: APP_URL/api/admin/google/callback. Real email registration needs a configured mail provider. Existing imported password hashes upgrade after successful login; old scrypt passwords need Node.

SQL Server export: powershell -ExecutionPolicy Bypass -File resources/scripts/export-sqlserver.ps1, then php artisan pixode:sync-sqlserver storage/app/private/sqlserver-migration.json --apply. Keep the source database quiescent during a final transfer.

Host only public/. Preserve APP_KEY, the database and uploaded files. Set APP_ENV=production, APP_DEBUG=false, APP_URL to HTTPS and SESSION_SECURE_COOKIE=true. Build assets and run php artisan optimize.
## Active SQL Server connection

The root .env now uses .\SQLEXPRESS, database PixodeLaravel, Windows Authentication, encryption and a trusted local server certificate. PHP runs as the current Windows user. The original Pixode database has legacy ASP.NET tables and is preserved separately. Laravel migrations created PixodeLaravel and pixode:transfer-sqlite copied the current Laravel content and accounts without overwriting the source.

The installed PHP drivers are Microsoft's official 5.12 x64 thread-safe builds for this XAMPP PHP 8.2 runtime. On another machine, install the matching pdo_sqlsrv driver and an ODBC SQL Server driver before migrating. Set blank DB_PORT for a named SQL Express instance. Production should use a trusted certificate and its own database identity.

Data flow: dashboard POST/PUT -> StudioController -> StudioContent transaction -> studio_sites content JSON and revision -> GET /api/admin/content or GET /api/content -> React. The public API filters drafts and private client records. Accounts are stored in users; contact inquiries are stored in studio_inquiries and read through GET /api/admin/inquiries. The local JSON content is only an offline preview/initial import source.

UI verification: start Laravel and Chrome debugging on port 9222, then php resources/scripts/preview-account.php prepare, node resources/scripts/verify-product.mjs, and php resources/scripts/preview-account.php cleanup. This creates a temporary editor and draft, verifies SQL Server persistence, and removes them afterwards. Screenshots are under storage/app/private/previews.