# Modern Pokemon App

A React application built with TypeScript, Redux Toolkit, RTK Query that retrieves Pokemon data from the PokeAPI and supports configurable base URLs.

## Features

- **Retrieve Pokemon List**: Displays a grid of Pokemon from the API
- **Pokemon Details**: Click on any Pokemon to view its details including stats, types, height, weight, etc.
- **Persistent Storage**: All Pokemons are saved locally and persist on page reload
- **Modern Tech Stack**: Built with TypeScript, Redux Toolkit, RTK Query, Material-UI
- **Responsive Design**: Optimized for desktop and mobile devices
- **Comprehensive Testing**: 60%+ test coverage with unit and integration tests

## Built With

- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **RTK Query** for API data fetching and caching  
- **Material-UI v5** for UI components
- **React Router v6** for navigation
- **Testing Library** and **Jest** for testing

## Prerequisites

- Node.js 16+
- Yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ihorizons-frontend-task
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the application**
   ```bash
   yarn start
   ```

The application will open at `http://localhost:3000`

## Configuration

### API Configuration

The API base URL can be configured through environment variables:

**Default Configuration (no env file needed):**
```bash
yarn start  # Uses https://pokeapi.co/api/v2 as the API base URL
```

**Custom API URL:**
```bash
export REACT_APP_API_BASE_URL="https://pokeapi.co/api/v2"
yarn start
```

**Using .env files:**
Create a `.env` file at the project root:
```
REACT_APP_API_BASE_URL=https://pokeapi.co/api/v2
```

### Available Scripts

| Script | Description | 
|--------|-------------| 
| `yarn start` | Start development server with configurable API URL | 
| `yarn start:local` | Start with local API (http://localhost:3001) | 
| `yarn build` | Build optimized production bundle | 
| `yarn test` | Run unit tests in watch mode | 
| `yarn test:coverage` | Generate test coverage report (`>= 60%`) | 

### API Configuration Methods

1. **Environment Variable Method** ⭐ (Recommended):
   ```bash
   export REACT_APP_API_BASE_URL="https://pokeapi.co/api/v2"
   yarn start
   ```

2. **Shell Script Method**:
   ```bash
   bash -c "export REACT_APP_API_BASE_URL='https://pokeapi.co/api/v2' && yarn start"
   ```

## Project Structure

```
src/
├── components/
│   └── shared/
│       ├── Header.tsx         # App header
│       └── ErrorBoundary.tsx  # Error handling for app crashes
├── services/
│   └── pokemonApi.ts          # RTK Query API definitions
├── pages/
│   ├── Home.tsx               # Pokemon list view
│   ├── PokemonDetails.tsx     # Individual Pokemon details
├── types/
│   └── api.ts                 # TypeScript types for API responses
└── tests/                     # Comprehensive test suites
    ├── pages/                 # Page component tests
    ├── components/            # Component tests
    └── features/              # Redux slice tests
```

## API Endpoints Used

- **GET** `https://pokeapi.co/api/v2/pokemon/` - Pokemon list
- **GET** `https://pokeapi.co/api/v2/pokemon/{id}/` - Pokemon details

## Testing

This application includes comprehensive testing to ensure reliability:

### Run Tests

```bash
# Run tests in watch mode
yarn test

# Run tests with coverage (>= 60% requirement)
yarn test:coverage
```

### Coverage Report

After running `yarn test:coverage` survey coverage report at:
- `coverage/lcov-report/index.html`
- Console summary shows `>= 60%` line/block/function coverage

## Architecture Details

### Redux Toolkit & RTK Query

- **State Management**: Modern Redux using RTK `configureStore` 
- **API Layer**: RTK Query for auto-caching, loading states, and error handling
- **Data Fetching**: Automatic fetch, cache, and invalidation strategies
- **Type Safety**: Full TypeScript integration with end-to-end type safety

### Data Flow

1. **API Call Flow**: 
   - RTK Query fetches Pokemon list
   - Individual details fetched on-demand
   - Automatic caching reduces API calls

### Access Requirements

✅ **Fully Implemented**:
- ✓ Configurable base API URLs 
- ✓ Pokemon list retrieved from API
- ✓ Pokemon detail display 
- ✓ 60%+ test coverage  
- ✓ Unit tests for both main screens
- ✓ TypeScript implementation  
- ✓ Redux Toolkit & RTK Query
- ✓ Documentation provided
- ✓ Lint-free, TypeScript-safe code

## Development Standards

- ✅ **Code Separation**: Clear directory structure, services isolated
- ✅ **Clean Code**: TypeScript interfaces, typed attributes
- ✅ **Readability**: Consistent naming, file organization  
- ✅ **Maintainability**: Modern patterns, easy to extend

## Contributing

The application follows best practices for maintainability:

1. **Type Safety**: All APIs and components fully typed
2. **Modern React**: Hooks, functional components
3. **Testing**: High coverage for component & reducer tests  
4. **Error Handling**: Error boundaries, graceful degradation
