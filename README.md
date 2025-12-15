# Travel Search App (Client)

A modern, responsive web application for discovering and sharing travel destinations. Built with Vue 3, Vite, and TailwindCSS.

## Features

- **🔍 Discover & Search:**

  - Browse a curated list of travel destinations.
  - Real-time search by keyword (title, description, or tags).
  - Filter trips by specific tags like "Beach", "Mountain", "Cafe".

- **🗺️ Interactive Maps:**

  - Integrated Google Maps to visualize trip locations.
  - "Open in Maps" feature to easily navigate to the destination.
  - Location picker when creating or editing a trip.

- **👤 User Accounts & Authentication:**

  - Secure Email/Password login and registration.
  - **Social Login:** One-click sign-in with Google and LINE.
  - Profile management to update user details.

- **✏️ Trip Management:**

  - **Create:** Share your own travel experiences with photos and details.
  - **Edit:** Update trip information, add more photos (up to 3), or change the location.
  - **Delete:** Remove trips you no longer want to share.

- **📱 Responsive Design:**
  - Fully optimized for a seamless experience on Mobile, Tablet, and Desktop.
  - Modern UI with smooth animations and transitions.

## Tech Stack

- **Framework:** [Vue 3](https://vuejs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [TailwindCSS](https://tailwindcss.com/) & [PrimeVue](https://primevue.org/)
- **Maps:** [vue3-google-map](https://github.com/inocan-group/vue3-google-map)
- **State Management:** Vue Reactivity API (ref, computed)
- **Routing:** Vue Router

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Setup & Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd client
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the `client` directory and add the following keys:

    ```env
    VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

## Running the Application

**Development Mode:**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

**Production Build:**

```bash
npm run build
```

The built files will be in the `dist` directory.

## Demo Account

To test the application, you can use the following credentials:

- **Email:** `test@test.com`
- **Password:** `test1234`

## Project Structure

- `src/components`: Reusable UI components (Navbar, TripCard, etc.)
- `src/views`: Page components (Home, MyTrips, etc.)
- `src/lib`: Utility functions and configurations (Supabase client)
- `src/assets`: Static assets (images, icons)
