# Storage Service

Handles persistent data storage using localStorage. Manages the scoreboard data including user profile information and KPI dashboards collected during the onboarding flow.

## Responsibilities
- Read and write the `scoreboard` JSON object from/to localStorage
- Check whether the user has completed the onboarding process
- Provide typed access to scoreboard data via the `IStorageService` interface
