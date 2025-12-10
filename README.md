# TABSERA Academy - Learning Center Management System

A comprehensive educational platform for managing learning centers, courses, and student enrollments across East Africa.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
tabsera-academy/
├── public/
│   ├── favicon.svg
│   └── logo.png              # Add your logo here
├── src/
│   ├── components/           # Shared UI components
│   │   ├── Header.jsx        # Public site header with navigation
│   │   ├── Footer.jsx        # Public site footer
│   │   ├── Layout.jsx        # Public page wrapper
│   │   ├── Hero.jsx          # Homepage hero section
│   │   ├── CourseCard.jsx    # Course display card
│   │   └── TrackCard.jsx     # Learning track card
│   ├── layouts/              # Portal layouts
│   │   ├── AdminLayout.jsx   # TABSERA admin portal layout
│   │   └── CenterLayout.jsx  # Learning center portal layout
│   ├── pages/
│   │   ├── public/           # Student-facing pages
│   │   │   ├── Home.jsx              # Homepage with tracks & courses
│   │   │   ├── Courses.jsx           # Course catalog with filters
│   │   │   ├── CourseDetail.jsx      # Individual course page
│   │   │   ├── LearningCentersListing.jsx  # Centers directory
│   │   │   └── BecomePartner.jsx     # Partner application
│   │   ├── admin/            # TABSERA Admin portal (9 pages)
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── PartnersList.jsx
│   │   │   ├── CenterContractConfiguration.jsx
│   │   │   ├── PartnerSettlementsOverview.jsx
│   │   │   ├── CenterSettlementDetails.jsx
│   │   │   ├── ProcessSettlement.jsx
│   │   │   ├── StudentRegistration.jsx
│   │   │   ├── TrackEnrollment.jsx
│   │   │   └── PasswordResetCenter.jsx
│   │   └── center/           # Learning Center portal (5 pages)
│   │       ├── CenterDashboard.jsx
│   │       ├── RevenueDashboard.jsx
│   │       ├── StudentFeeTracker.jsx
│   │       ├── SettlementHistory.jsx
│   │       └── TeacherProgressTracker.jsx
│   ├── utils/
│   │   └── mockData.js       # Sample courses & tracks data
│   ├── App.jsx               # Main router configuration
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles & Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🔗 Routes

### Public Routes (Student-facing)
| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Homepage with tracks, courses, stats |
| `/courses` | Courses | All courses with track filtering |
| `/courses?track=1` | Courses (filtered) | Courses for specific track |
| `/courses/:id` | CourseDetail | Individual course with enrollment |
| `/centers` | LearningCentersListing | Partner centers directory |
| `/partner` | BecomePartner | Partner application form |

### Admin Portal Routes (`/admin/*`)
| Route | Page | Description |
|-------|------|-------------|
| `/admin/dashboard` | AdminDashboard | Overview with stats & pending items |
| `/admin/partners` | PartnersList | All partner centers |
| `/admin/partners/:id` | CenterContractConfiguration | Contract & revenue settings |
| `/admin/settlements` | PartnerSettlementsOverview | All center settlements |
| `/admin/settlements/:id` | CenterSettlementDetails | Individual settlement |
| `/admin/settlements/process` | ProcessSettlement | 4-step settlement workflow |
| `/admin/students` | StudentRegistration | Student management |
| `/admin/students/enroll` | TrackEnrollment | Bulk CSV enrollment |
| `/admin/password-reset` | PasswordResetCenter | User password management |

### Center Portal Routes (`/center/*`)
| Route | Page | Description |
|-------|------|-------------|
| `/center/dashboard` | CenterDashboard | Center overview |
| `/center/revenue` | RevenueDashboard | Revenue & partnership details |
| `/center/fees` | StudentFeeTracker | Student payment tracking |
| `/center/settlements` | SettlementHistory | Settlement history & invoices |
| `/center/progress` | TeacherProgressTracker | Student progress monitoring |

## 💰 Revenue Model

The system supports configurable revenue sharing between TABSERA and Learning Centers:

- **Standard**: 50% TABSERA / 50% Center
- **Premium**: 40% TABSERA / 60% Center
- **Custom**: Negotiable terms

### Example Calculation
```
Monthly Fees Collected: $4,900
Revenue Split: 50/50

TABSERA Share: $2,450
Center Share: $2,450
```

## 📚 Learning Tracks

| ID | Track Name | Monthly Price | Category |
|----|------------|---------------|----------|
| 1 | Cambridge IGCSE Full | $80 | IGCSE |
| 2 | Islamic Studies | $25 | Islamic Studies |
| 3 | Business Track | $45 | Business |
| 4 | ESL Intensive | $30 | ESL |
| 5 | Science Track | $60 | Science |
| 6 | Arabic Language | $35 | Languages |

## 🎨 Design System

### Colors
- **Primary**: Blue-600 (`#2563eb`)
- **Accent**: Cyan-500 (`#06b6d4`)
- **Success**: Green-500 (`#22c55e`)
- **Warning**: Yellow-500 (`#eab308`)
- **Danger**: Red-500 (`#ef4444`)
- **Sidebar**: Dark slate (`#0f172a`)

### Components
- Cards: `rounded-2xl shadow-sm border-gray-100`
- Buttons: `rounded-xl font-semibold`
- Inputs: `rounded-xl border-gray-200 focus:ring-2`
- Badges: `rounded-full px-2.5 py-1 text-xs font-semibold`

## 🛠 Tech Stack

- **Framework**: React 18
- **Router**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build**: Vite

## 📝 Notes for Developers

1. **Logo**: Place your `logo.png` in the `public/` folder
2. **API Integration**: Replace mock data in `src/utils/mockData.js` with actual API calls
3. **Authentication**: Add auth logic to protect `/admin/*` and `/center/*` routes
4. **Payments**: Integrate payment gateway for student self-enrollment

## 🌍 Sample Data

The project includes sample data for:
- 8 Partner Learning Centers (Somalia, Kenya, Ethiopia, Uganda, Tanzania)
- 8 Courses across 6 tracks
- Student enrollment and payment records
- Settlement history

## 📧 Contact

For questions about this project, contact the TABSERA Academy team.
