# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Lighthouse CI for performance and accessibility auditing
- Bundle size budget checks in CI pipeline
- Kubernetes health check probes (startup, readiness, liveness)
- Helm chart for Kubernetes deployment
- Production Docker Compose configuration
- Nginx reverse proxy with rate limiting and caching
- Frontend `.env.example`
- GitHub issue and PR templates

### Fixed
- Accessibility: dark mode text contrast ratios (WCAG AA)
- Accessibility: aria-labels on all icon-only buttons
- Accessibility: descriptive alt text on profile images
- Frontend TypeScript strict mode (target: ES2015)

## [1.0.0] - 2025-01-01

### Added
- 12-role RBAC system (User, DepartmentHead, CollegeHead, Dean, President, DeploymentTeam, TransportOffice, MaintenanceTeam, Driver, Gate, Developer, SystemAdmin)
- 17 backend modules with NestJS and TypeORM
- Real-time GPS tracking with Leaflet maps
- Trip request and approval workflow
- Fuel management and reporting
- Maintenance request system
- SMS and email notifications (Brevo)
- Push notifications with Web VAPI
- Flutter mobile app for drivers and gate scanners
- Docker and Docker Compose support
- Swagger/OpenAPI documentation
- Unit tests for auth and app modules
