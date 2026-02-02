# Trip Generation API Fix - Part 2 (Data Validation)

## Problem
The backend was returning 400 Validation Errors:
- `The Title field is required.`
- `The Description field is required.`

Even after extracting the data from the `output` property, the AI response might be using different field names (e.g., `name` instead of `title`) or might be missing some required fields that the backend expects.

## Solution
Implemented a **Data Normalization Layer** in `store/features/trip/tripApi.ts`. This step ensures that every field required by the backend is correctly mapped and populated before the final POST request.

### 1. Robust Field Mapping
The generator now looks for multiple variations of each field:
- **Title**: `title` || `Title` || `name` || "My Egypt Trip"
- **Description**: `description` || `Description` || `summary` || "A beautiful trip itinerary to Egypt"
- **Travel Companions**: `travelCompanions` || Original request's `groupSize`
- **Price**: AI's `price` || Original request's `budget`
- **Activities**: Maps nested fields like `activity.type` safely.

### 2. Request Fallbacks
If the AI forgets to provide metadata (like the start date or duration), the system now automatically falls back to the values originally selected by the user in the wizard.

### 3. Detailed Logging
The console now clearly shows the transformation:
1. `Raw trip data from AI`: What was received from Relevance AI.
2. `Normalized trip data for backend`: The exact payload being sent to `/Trip`.
3. `Created trip`: The final result from the database.

## Changes Made
- Updated `generateTripWithAI` query function with normalization logic.
- Guaranteed `title` and `description` are never empty/null.
- Ensured nested objects (days/activities) follow the same safety patterns.

## Debugging
If you still see errors, check the browser console for:
- `Normalized trip data for backend`: Check if `title` and `description` are strings.
- `Backend error`: Will show if the backend still rejects any other field.
