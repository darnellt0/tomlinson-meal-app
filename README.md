# Tomlinson Family Meal Planning App

A health-first meal planning application built for families managing diabetes, high blood pressure, and Whole30/post-Whole30 eating patterns.

## 🌟 Features

- **Whole30 Mode Toggle** - Switch between strict Whole30 compliance and health-conscious post-Whole30 eating
- **Family Health Profiles** - Manage health conditions (diabetes, high BP) and device preferences (Freestyle Libre, Fitbit)
- **Ingredient Exclusion** - Avoid specific ingredients (e.g., plantains, shellfish)
- **Daily Meal Planning** - View today's breakfast, lunch, and dinner with recipe details
- **30-Day Calendar** - See your full meal plan with cuisine focus and batch notes
- **Weekly Grocery Lists** - Checkable shopping lists organized by category (Weeks 1-4)
- **Recipe Database** - Detailed recipes with ingredients, steps, and health notes
- **Google Sheets Integration** - All meal data synced from Google Sheets in real-time
- **Health Scoring** - Recipe scoring based on Whole30 compliance, diabetic-friendliness, low-sodium, and more
- **Device Integration Ready** - Stub interfaces for future Freestyle Libre (glucose) and Fitbit (activity) integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
git clone https://github.com/darnellt0/tomlinson-meal-app.git
cd tomlinson-meal-app
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

```bash
npm run build
npm start
```

## 📖 Documentation

- **[WHOLE30_MODE_GUIDE.md](./WHOLE30_MODE_GUIDE.md)** - Complete guide to using and extending the Whole30 Mode system
- **[QA_REPORT.md](./QA_REPORT.md)** - Comprehensive QA analysis with bugs, UX issues, health alignment scores, and feature roadmap

## 🩺 Health Settings

Click the **"Health Settings"** button in the header to:
1. Toggle between **Whole30 Mode** and **Post-Whole30 Mode**
2. View family health profiles (diabetes, high BP, devices)
3. Add/remove avoided ingredients
4. Set cooking preferences (Instant Pot, diabetic-friendly, low-sodium)

Settings persist to your browser's localStorage.

## 🏗️ Project Structure

```
tomlinson-meal-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # App layout with HealthSettingsProvider
│   │   ├── page.tsx            # Main page with tabs (Today, Calendar, Groceries)
│   │   └── globals.css
│   ├── components/
│   │   ├── NavTabs.tsx                 # Navigation tabs
│   │   ├── HealthSettingsPanel.tsx     # Health settings UI (NEW)
│   │   ├── views/
│   │   │   ├── TodayView.tsx           # Today's meals
│   │   │   ├── CalendarView.tsx        # 30-day calendar
│   │   │   ├── GroceriesView.tsx       # Weekly grocery lists
│   │   │   ├── TrackingView.tsx        # (disabled) Daily tracking
│   │   │   ├── PrepView.tsx            # (disabled) Meal prep schedule
│   │   │   ├── ReflectionView.tsx      # (disabled) Weekly reflection
│   │   │   └── MetricsView.tsx         # (disabled) Success metrics
│   │   └── ui/                         # Radix UI components
│   ├── lib/
│   │   ├── recipes.ts                  # Recipe types and CSV parsing
│   │   ├── types.ts                    # Google Sheets row types
│   │   ├── loaders.ts                  # CSV loaders
│   │   ├── sheets.ts                   # CSV fetch utilities
│   │   ├── health-settings.ts          # Whole30 Mode system (NEW)
│   │   └── device-integration.ts       # Device integration stubs (NEW)
│   └── contexts/
│       └── HealthSettingsContext.tsx   # Health settings state (NEW)
├── QA_REPORT.md                        # Comprehensive QA analysis (NEW)
├── WHOLE30_MODE_GUIDE.md               # Whole30 Mode implementation guide (NEW)
└── package.json
```

## 🧪 Testing

### Manual Testing

1. Open app at http://localhost:3000
2. Test mode toggle in Health Settings
3. Verify settings persist after refresh
4. Test ingredient avoidance
5. Check Today, Calendar, and Groceries views

### Automated Testing (TODO)

Playwright tests planned. See `QA_REPORT.md` section 7 for test examples.

## 🛣️ Roadmap

See `QA_REPORT.md` section 6 for detailed feature roadmap.

### High Priority
- ✅ Whole30 Mode toggle (DONE)
- Populate recipe compliance data in Google Sheets
- Fix critical bugs (error handling, grocery persistence)
- Re-enable disabled views (Tracking, Prep, Reflection, Metrics)
- Implement recipe filtering based on mode

### Medium Priority
- Smart Week Planner (generate mode-appropriate weekly plan)
- Search functionality
- Recipe source integration (Nom Nom Paleo, The Defined Dish, etc.)
- Instant Pot tagging and filtering

### Long-term
- Device integration (Freestyle Libre, Fitbit APIs)
- AI meal suggestions
- Mobile app (React Native or PWA)

## 🤝 Contributing

1. Review `QA_REPORT.md` for open issues
2. Create GitHub issues from templates in the QA report
3. Fork and submit PRs

## 📜 License

Private project for Tomlinson Family.

## 🙏 Credits

- **Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Radix UI
- **Data Source:** Google Sheets
- **Whole30 Mode System:** Designed and implemented by MealPlan QA Agent (2025-11-13)
- **Family:** Darnell, Shria, and Mom - for inspiring a health-first approach to meal planning

## 📞 Support

For bugs or feature requests, see `QA_REPORT.md` and create GitHub issues.
