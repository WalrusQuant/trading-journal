# TradeTracker Pro - Trading Journal Application

A comprehensive, modern trading journal web application built with Next.js 14, TypeScript, and Tailwind CSS. Track, analyze, and improve your trading performance across multiple asset classes.

![TradeTracker Pro](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## Features

### 📊 Comprehensive Trading Journal
- **Multi-Asset Support**: Trade stocks, options, futures, crypto, and forex
- **Detailed Trade Entry**: Record entry/exit prices, quantities, fees, and confidence levels
- **Rich Notes**: Add detailed notes and reasoning for each trade
- **Tag System**: Categorize trades by strategy, setup, market conditions, or mistakes
- **Image Support**: Upload chart screenshots (base64 storage)

### 📈 Performance Analytics
- **Real-time Metrics**: Win rate, profit factor, total P&L, average hold time
- **Performance Breakdown**: Analyze by asset type, tags, and time periods
- **Best/Worst Trades**: Track your most profitable and costly trades
- **Daily P&L Tracking**: Monitor daily performance and cumulative returns

### 🎯 Trade Setups
- **Pre-Trade Planning**: Create setups before entering positions
- **Risk/Reward Calculator**: Auto-calculate R:R ratios
- **Setup Conversion**: Convert setups to actual trades with one click
- **Active/Completed Status**: Track which setups are still valid

### 📅 Calendar View
- **Visual Performance**: See daily P&L color-coded on a calendar
- **Monthly Summary**: Quick stats for the current month
- **Trade Density**: Identify your most active trading days

### 💼 Multi-Portfolio Management
- **Separate Accounts**: Manage different brokers or strategies independently
- **Portfolio Switching**: Easily switch between active portfolios
- **Deposits/Withdrawals**: Track cash flow in and out of portfolios
- **Combined View**: Aggregate performance across all portfolios

### 🎨 Modern UI/UX
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Mobile Navigation**: Touch-friendly hamburger menu on mobile
- **Fast Performance**: Optimized with React hooks and memoization

### 🔒 Privacy & Data
- **Local Storage**: All data stored locally in your browser (no cloud dependency)
- **Export/Import**: Backup and restore your data as JSON
- **Privacy Mode**: Hide dollar amounts for screenshots
- **CSV Export**: Export trades to CSV for external analysis

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context API
- **Data Persistence**: Browser localStorage
- **Charts**: Recharts (for visual analytics)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Modern web browser with localStorage support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/trading-journal.git
cd trading-journal
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
trading-journal/
├── app/
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and business logic
│   │   ├── contexts/        # React Context providers
│   │   ├── types.ts         # TypeScript interfaces
│   │   ├── storage.ts       # localStorage helpers
│   │   ├── calculations.ts  # Trading calculations
│   │   ├── formatters.ts    # Data formatters
│   │   └── utils.ts         # Utility functions
│   ├── trades/              # Trade pages
│   ├── setups/              # Setup pages
│   ├── analytics/           # Analytics page
│   ├── calendar/            # Calendar view
│   ├── portfolios/          # Portfolio management
│   ├── tags/                # Tag management
│   ├── settings/            # Settings page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Dashboard
│   └── globals.css          # Global styles
├── public/                  # Static assets
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Usage Guide

### Creating Your First Portfolio

1. Navigate to **Portfolios** in the sidebar
2. Click **New Portfolio**
3. Enter portfolio name, initial balance, and currency
4. Click **Create Portfolio**

### Adding a Trade

1. Click **New Trade** from the Dashboard or Trades page
2. Fill in required fields (ticker, asset type, direction, entry price, quantity)
3. For closed trades, add exit date and price
4. Add tags to categorize the trade
5. Add notes about your reasoning
6. Click **Add Trade**

### Creating a Trade Setup

1. Go to **Setups** and click **New Setup**
2. Enter planned entry, stop loss, and target prices
3. The risk/reward ratio calculates automatically
4. Save the setup to reference before entering the trade

### Viewing Analytics

1. Navigate to **Analytics**
2. View performance metrics, win/loss breakdown, and tag performance
3. Analyze which strategies and asset types perform best

### Exporting Data

1. Go to **Settings**
2. Click **Export Data** to download a JSON backup
3. Store the backup file safely
4. Use **Import Data** to restore from a backup

## Data Privacy

- **All data is stored locally** in your browser's localStorage
- No data is sent to external servers
- **Backup regularly** using the export feature
- Clearing browser data will delete your trading journal

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Deploy with default settings
4. Your app will be live instantly

This is a standard Next.js app and can be deployed to Vercel, Netlify, Railway, AWS Amplify, or any platform supporting Next.js.

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6+ and localStorage support

## License

This project is open source and available under the MIT License.

---

**Built with ❤️ for traders by traders**