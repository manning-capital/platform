# Manning Capital Trading Platform

A modern Angular 21 application for real-time quantitative trading model performance monitoring and live trade tracking.

## Overview

The Manning Capital Trading Platform provides comprehensive tools for monitoring quantitative trading models, analyzing trade performance, and tracking live positions. The platform features a clean, responsive interface with advanced filtering, detailed analytics, and support for both simple and compound trades.

## Features

### Core Functionality

- **📊 Dashboard**: Real-time overview of trading performance, active models, and recent trades
- **📈 Model Performance**: Detailed analytics for each quantitative model with metrics, trade history, and pagination
- **💹 Live Trades Monitor**: Real-time trade tracking with advanced filtering, pagination, and master-detail view
- **🔄 Compound Trades**: Support for multi-position trades (e.g., pairs trading strategies)
- **📉 Custom Charts**: SVG-based charts for trade metrics, signals, and time series data
- **📋 Trade Metrics**: Comprehensive metrics including strategy exit conditions, model parameters, and performance indicators

### User Experience

- **🎨 Dual Themes**: Light and dark mode with custom color palette
- **📱 Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **🔍 Advanced Filtering**: Filter trades by status, side, model, symbol, and date range
- **🔗 URL State Management**: Bookmarkable URLs with query parameters for filters and selected items
- **⚡ Real-time Updates**: Live price updates and trade status changes
- **📄 Pagination**: Efficient pagination for large trade lists

### Additional Pages

- **ℹ️ About Page**: Introduction and contact information with links to GitHub and LinkedIn

## Tech Stack

- **Framework**: Angular 21 (Standalone Components)
- **State Management**: Angular Signals
- **Routing**: Angular Router with route parameters
- **Styling**: CSS with CSS Variables for theming
- **Charts**: Custom SVG implementation
- **Build**: Angular CLI
- **Deployment**: Docker with Node.js serve

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- Docker (optional, for containerized deployment)

### Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Navigate to http://localhost:4200
```

### Production Build

```bash
# Build for production
npm run build

# Output will be in dist/platform/browser/
```

### Docker Deployment

```bash
# Build Docker image
docker build -t manning-capital-platform .

# Run container
docker run -p 8080:8080 manning-capital-platform

# Access at http://localhost:8080
```

## Project Structure

```
platform/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── about/                 # About page with contact info
│   │   │   ├── dashboard/            # Main dashboard
│   │   │   ├── live-trades/           # Live trades monitor
│   │   │   ├── model-performance/     # Model analytics
│   │   │   ├── trade-chart/          # Chart component
│   │   │   └── trade-metrics/        # Metrics display
│   │   ├── models/
│   │   │   └── trade.model.ts        # TypeScript interfaces
│   │   ├── services/
│   │   │   ├── theme.service.ts      # Theme management
│   │   │   └── trading.service.ts    # Trading data service
│   │   ├── app.ts                    # Root component
│   │   ├── app.routes.ts             # Routing configuration
│   │   └── app.html                  # Root template
│   ├── styles.css                    # Global styles and theme
│   └── index.html                    # Entry point
├── public/
│   └── logo.png                      # Application logo
├── Dockerfile                        # Docker configuration
└── package.json                      # Dependencies
```

## Features in Detail

### Dashboard

- Real-time statistics overview (Total P&L, Today's P&L, Active Models, Open Trades)
- Quantitative models grid with key metrics
- Recent trades table with quick navigation
- Responsive card layout for mobile devices

### Model Performance

- Card-based model overview with status indicators
- Detailed model view with route-based navigation (`/models/:id`)
- Comprehensive metrics:
  - Total Profit/Loss
  - Win Rate
  - Sharpe Ratio
  - Max Drawdown
  - Average Win/Loss
  - Profit Factor
  - Expectancy
- Paginated trade history table
- "View All Trades" link with pre-populated filters
- Mobile-responsive card layout for trade history

### Live Trades Monitor

- **Master-Detail Layout**: Trade list and detail view side-by-side (desktop) or stacked (mobile)
- **Advanced Filtering**:
  - Search by symbol/asset
  - Filter by status (All/Open/Closed)
  - Filter by side (All/Buy/Sell/Compound)
  - Filter by model
  - Date range filtering (defaults to past week, always includes open positions)
- **Pagination**: 10 trades per page with smart pagination controls
- **URL State Management**: All filters and pagination state stored in URL query parameters
- **Trade Details**:
  - Trade information and price data
  - Performance metrics with custom charts
  - Strategy exit conditions
  - Model parameters
  - Positions table (for compound trades)
- **Compound Trade Support**: 
  - Multi-position trades with from/to asset pairs
  - Positions displayed in table format (desktop) or cards (mobile)
  - Aggregate P&L calculation
- **Real-time Updates**: Live price updates with automatic P&L recalculation
- **Mobile Optimized**: 
  - Filters hidden when viewing trade detail
  - Back button for navigation
  - Card-based layouts for tables

### Trade Charts

- Multiple time series views (Price, Volume, Spread, etc.)
- Signal markers (Entry, Exit, Stop Loss, Take Profit)
- Customizable color scheme
- Responsive sizing

### Theme System

- **Dark Mode**: Black and dark colors with accent colors
- **Light Mode**: White and off-white with accent colors
- **Color Palette**: Custom palette with 10 colors for various UI elements
- **Persistent Theme**: Theme selection saved in localStorage
- **Smooth Transitions**: Theme switching with smooth color transitions

## Color Palette

The application uses a custom color palette defined in CSS variables:

- **Strawberry Red** (#f94144): Negative indicators, stop loss
- **Atomic Tangerine** (#f3722c): Warnings, accents
- **Carrot Orange** (#f8961e): Exit signals, highlights
- **Tuscan Sun** (#f9c74f): Charts, secondary accents
- **Willow Green** (#90be6d): Positive indicators
- **Seagrass** (#43aa8b): Entry signals, primary positive
- **Blue Slate** (#577590): Accent color, navigation
- **Slate Grey** (#66829a): Secondary text
- **Air Force Blue** (#748da3): Take profit signals
- **Cool Steel** (#8197ab): Tertiary elements

## Routing

- `/` - Redirects to dashboard
- `/dashboard` - Main dashboard
- `/models` - Model list view
- `/models/:id` - Model detail view
- `/live-trades` - Live trades monitor
- `/about` - About page with contact information

## Mobile Responsiveness

The application is fully responsive with mobile-specific optimizations:

- **Navigation**: Top-sliding menu on mobile
- **Layouts**: Card-based layouts replace tables on mobile
- **Filtering**: Filters hidden when viewing details on mobile
- **Navigation**: Back buttons for easy navigation
- **Touch-Friendly**: Large touch targets and optimized spacing

## Development

### Code Style

- Prettier configuration included
- Single quotes for strings
- 100 character line width
- Angular HTML parser for templates

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

The production build will be output to `dist/platform/browser/`.

## Configuration

### Mock Data

The application currently uses mock data generated in `TradingService`. To connect to a real backend:

1. Create environment configuration files
2. Update `TradingService` to fetch from API endpoints
3. Add API URL to environment config
4. Handle authentication if required

### Customization

- **Colors**: Edit CSS variables in `src/styles.css`
- **Mock Data**: Modify `src/app/services/trading.service.ts`
- **Routes**: Update `src/app/app.routes.ts`
- **Contact Info**: Update `src/app/components/about/about.component.ts`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

### Docker

The application includes a multi-stage Dockerfile that:
1. Builds the Angular application
2. Serves it using Node.js `serve` package

```bash
docker build -t manning-capital-platform .
docker run -p 8080:8080 manning-capital-platform
```

### Static Hosting

Build the application and deploy the `dist/platform/browser/` directory to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages
- Any web server

## License

Private - All rights reserved

## Contact

For questions or support, visit the [About page](/about) or contact:
- Email: glynfinck@gmail.com
- Phone: +44 7765 564378
- GitHub: [Personal](https://github.com/glynfinck) | [Organization](https://github.com/manning-capital)
- LinkedIn: [Profile](https://linkedin.com/in/glynfinck)
