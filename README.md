# Quant Trading Platform

A modern Angular 21 application for tracking quantitative model performance and monitoring live trades.

## Features

- 📊 **Dashboard**: Overview of trading performance and key metrics
- 📈 **Model Performance**: Detailed analytics for each quantitative model
- 💹 **Live Trades Monitor**: Real-time trade tracking with filtering and pagination
- 🎨 **Dual Themes**: Light and dark mode with Forest Reverie color palette
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 📉 **Custom Charts**: SVG-based charts for trade metrics and signals

## Tech Stack

- **Framework**: Angular 21 (Standalone Components)
- **State Management**: Angular Signals
- **Routing**: Angular Router
- **Styling**: CSS with CSS Variables
- **Charts**: Custom SVG implementation
- **Build**: Angular CLI
- **Deployment**: Docker + Kubernetes

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Navigate to http://localhost:4200
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access at http://localhost:8080
```

See [DOCKER.md](DOCKER.md) for detailed Docker instructions.

### Kubernetes

```bash
# Quick deployment (for local clusters)
./deploy.sh

# Manual deployment
docker build -t quant-platform:v1.0.0 .
kubectl apply -f k8s/

# Access the application
kubectl port-forward service/quant-platform 8080:80
```

See [KUBERNETES.md](KUBERNETES.md) for detailed Kubernetes deployment guide.

## Project Structure

```
platform/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/           # Main dashboard
│   │   │   ├── model-performance/   # Model analytics
│   │   │   ├── live-trades/         # Live trades monitor
│   │   │   ├── trade-chart/         # Chart component
│   │   │   └── trade-metrics/       # Metrics display
│   │   ├── models/                  # TypeScript interfaces
│   │   ├── services/                # Angular services
│   │   ├── app.ts                   # Root component
│   │   └── app.routes.ts            # Routing config
│   ├── styles.css                   # Global styles
│   └── index.html                   # Entry point
├── k8s/                             # Kubernetes manifests
├── Dockerfile                       # Docker configuration
├── docker-compose.yml               # Docker Compose config
└── deploy.sh                        # Deployment script

## Color Palette

The application uses the Forest Reverie color scheme:

- **Deep Green** (#49694c): Primary elements, headings
- **Sage Green** (#a8c4a1): Positive indicators, accent
- **Cream** (#e9d5a0): Text, backgrounds (light mode)
- **Warm Orange** (#f6a055): Charts, warnings
- **Terracotta** (#c16149): Negative indicators, alerts

## Features in Detail

### Dashboard
- Real-time statistics overview
- Active models summary
- Recent trades list
- Quick navigation to detailed views

### Model Performance
- Card-based model overview
- Detailed metrics for each model (Sharpe ratio, win rate, P&L, etc.)
- Trade history table
- Performance indicators

### Live Trades Monitor
- Master-detail view with trade list and details
- Advanced filtering (symbol, status, side, model, date range)
- Pagination support (10 trades per page)
- Real-time price updates
- Trade metrics with custom charts
- Strategy exit conditions display
- Multiple time series views (price, volume, spread, etc.)

### Theme System
- Dark and light modes
- Persistent theme selection
- Smooth transitions
- Custom color palette

## Development

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Code Style
```bash
# Format code
npm run format

# Lint code
npm run lint
```

## Deployment Options

### 1. Docker (Simple)
Best for: Small deployments, development, single-server hosting
- See [DOCKER.md](DOCKER.md)

### 2. Kubernetes (Scalable)
Best for: Production, high availability, auto-scaling
- See [KUBERNETES.md](KUBERNETES.md)

### 3. Static Hosting
Build and deploy to any static host:
```bash
npm run build
# Upload dist/platform/browser/ to your host
```

## Configuration

### Environment Variables
Currently uses mock data. To connect to a real backend:

1. Create environment configuration
2. Update `TradingService` to fetch from API
3. Add API URL to environment config

### Customization
- **Colors**: Edit CSS variables in `src/styles.css`
- **Mock Data**: Modify `src/app/services/trading.service.ts`
- **Routes**: Update `src/app/app.routes.ts`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

Private - All rights reserved

## Support

For issues and questions, please open an issue on the repository.
