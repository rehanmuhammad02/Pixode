# Architecture

Laravel handles routing, sessions, CSRF, authentication, authorization and persistence. React source lives in resources/js/studio. Vite builds public/build; resources/views/studio.blade.php loads its manifest. The website and /admin share one Laravel application and one root .env.

StudioAccess middleware protects dashboard APIs. Controllers and services live in app/. Database migrations live in database/migrations. Initial content is database/content-defaults.json. Original data is preserved privately under storage/app/private/migration-source.