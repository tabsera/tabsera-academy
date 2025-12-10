// Track data - TABSERA Academy learning tracks
export const tracks = [
  {
    id: '1',
    title: 'Cambridge IGCSE Full',
    icon: 'graduation-cap',
    color: 'bg-blue-100 text-blue-600',
    coursesCount: 12,
    price: 80,
    description: 'Complete Cambridge IGCSE curriculum for students aged 14-16'
  },
  {
    id: '2',
    title: 'Islamic Studies',
    icon: 'book-open',
    color: 'bg-emerald-100 text-emerald-600',
    coursesCount: 8,
    price: 25,
    description: 'Comprehensive Islamic education with Quran, Hadith, and Fiqh'
  },
  {
    id: '3',
    title: 'Business Track',
    icon: 'briefcase',
    color: 'bg-purple-100 text-purple-600',
    coursesCount: 5,
    price: 45,
    description: 'Business studies and entrepreneurship fundamentals'
  },
  {
    id: '4',
    title: 'ESL Intensive',
    icon: 'languages',
    color: 'bg-yellow-100 text-yellow-600',
    coursesCount: 10,
    price: 30,
    description: 'English as Second Language accelerated program'
  },
  {
    id: '5',
    title: 'Science Track',
    icon: 'flask',
    color: 'bg-cyan-100 text-cyan-600',
    coursesCount: 10,
    price: 60,
    description: 'Advanced science curriculum with practical experiments'
  },
  {
    id: '6',
    title: 'Arabic Language',
    icon: 'scroll',
    color: 'bg-orange-100 text-orange-600',
    coursesCount: 6,
    price: 35,
    description: 'Classical and Modern Standard Arabic language course'
  }
];

// Course data - Individual courses within tracks
export const courses = [
  {
    id: '1',
    title: 'Cambridge IGCSE Mathematics',
    description: 'Complete IGCSE Mathematics course covering algebra, geometry, statistics, and calculus fundamentals with exam preparation.',
    price: 29.99,
    originalPrice: 49.99,
    rating: 4.8,
    reviews: 420,
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'IGCSE',
    level: 'Intermediate',
    duration: '6 Months',
    lessons: 120,
    students: 1540,
    trackId: '1',
    instructor: {
      name: 'Dr. Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      role: 'Head of Mathematics'
    }
  },
  {
    id: '2',
    title: 'IGCSE English Language',
    description: 'Master reading comprehension, writing skills, and oral communication for Cambridge IGCSE English examination.',
    price: 29.99,
    rating: 4.9,
    reviews: 380,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'IGCSE',
    level: 'Intermediate',
    duration: '6 Months',
    lessons: 100,
    students: 1320,
    trackId: '1',
    instructor: {
      name: 'James Anderson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      role: 'English Language Expert'
    }
  },
  {
    id: '3',
    title: 'Quranic Studies & Tajweed',
    description: 'Learn proper Quran recitation with Tajweed rules, memorization techniques, and understanding of key Surahs.',
    price: 19.99,
    originalPrice: 29.99,
    rating: 4.9,
    reviews: 650,
    image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Islamic Studies',
    level: 'All Levels',
    duration: '12 Months',
    lessons: 150,
    students: 2100,
    trackId: '2',
    instructor: {
      name: 'Sheikh Ahmad Hassan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      role: 'Quran Teacher'
    }
  },
  {
    id: '4',
    title: 'Islamic History & Civilization',
    description: 'Explore the rich history of Islamic civilization from the Prophet\'s era through the Golden Age to modern times.',
    price: 14.99,
    rating: 4.7,
    reviews: 290,
    image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Islamic Studies',
    level: 'Beginner',
    duration: '4 Months',
    lessons: 48,
    students: 890,
    trackId: '2',
    instructor: {
      name: 'Dr. Fatima Omar',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      role: 'Islamic History Scholar'
    }
  },
  {
    id: '5',
    title: 'Business Fundamentals',
    description: 'Learn essential business concepts including accounting, marketing, management, and entrepreneurship basics.',
    price: 34.99,
    originalPrice: 59.99,
    rating: 4.6,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Business',
    level: 'Beginner',
    duration: '3 Months',
    lessons: 60,
    students: 650,
    trackId: '3',
    instructor: {
      name: 'Mohamed Ali',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      role: 'Business Consultant'
    }
  },
  {
    id: '6',
    title: 'ESL Foundation Course',
    description: 'Build strong English language foundations with speaking, listening, reading, and writing skills for non-native speakers.',
    price: 24.99,
    rating: 4.8,
    reviews: 520,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'ESL',
    level: 'Beginner',
    duration: '4 Months',
    lessons: 80,
    students: 1850,
    trackId: '4',
    instructor: {
      name: 'Emily Davis',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      role: 'ESL Specialist'
    }
  },
  {
    id: '7',
    title: 'IGCSE Biology',
    description: 'Comprehensive biology course covering cells, genetics, ecology, and human biology for IGCSE examination.',
    price: 29.99,
    rating: 4.7,
    reviews: 340,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Science',
    level: 'Intermediate',
    duration: '6 Months',
    lessons: 110,
    students: 980,
    trackId: '5',
    instructor: {
      name: 'Dr. Robert Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      role: 'Biology Professor'
    }
  },
  {
    id: '8',
    title: 'Arabic for Beginners',
    description: 'Start your Arabic language journey with alphabet, basic vocabulary, grammar, and conversational skills.',
    price: 19.99,
    originalPrice: 34.99,
    rating: 4.8,
    reviews: 410,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Languages',
    level: 'Beginner',
    duration: '3 Months',
    lessons: 60,
    students: 1200,
    trackId: '6',
    instructor: {
      name: 'Amina Hassan',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      role: 'Arabic Language Expert'
    }
  }
];

// Learning Centers data
export const learningCenters = [
  {
    id: '1',
    name: 'Aqoonyahan School',
    location: 'Hargeisa, Somalia',
    country: 'Somalia',
    flag: '🇸🇴',
    students: 60,
    courses: 6,
    rating: 4.8,
    status: 'active',
    joinedDate: '2021-03-15',
    contact: {
      email: 'info@aqoonyahan.so',
      phone: '+252 63 XXX XXXX',
      address: 'Main Street, Hargeisa'
    },
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    name: 'Sunrise International Academy',
    location: 'Nairobi, Kenya',
    country: 'Kenya',
    flag: '🇰🇪',
    students: 120,
    courses: 8,
    rating: 4.9,
    status: 'active',
    joinedDate: '2020-09-01',
    contact: {
      email: 'info@sunrise.co.ke',
      phone: '+254 7XX XXX XXX',
      address: 'Westlands, Nairobi'
    },
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    name: 'Excel Academy',
    location: 'Addis Ababa, Ethiopia',
    country: 'Ethiopia',
    flag: '🇪🇹',
    students: 85,
    courses: 5,
    rating: 4.7,
    status: 'active',
    joinedDate: '2022-01-10',
    contact: {
      email: 'info@excelacademy.et',
      phone: '+251 9XX XXX XXX',
      address: 'Bole, Addis Ababa'
    },
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    name: 'Al-Noor Islamic Center',
    location: 'Kampala, Uganda',
    country: 'Uganda',
    flag: '🇺🇬',
    students: 95,
    courses: 6,
    rating: 4.8,
    status: 'active',
    joinedDate: '2021-06-20',
    contact: {
      email: 'info@alnoor.ug',
      phone: '+256 7XX XXX XXX',
      address: 'Wandegeya, Kampala'
    },
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '5',
    name: 'Dar Al-Ilm Academy',
    location: 'Dar es Salaam, Tanzania',
    country: 'Tanzania',
    flag: '🇹🇿',
    students: 75,
    courses: 5,
    rating: 4.6,
    status: 'active',
    joinedDate: '2022-04-05',
    contact: {
      email: 'info@daralilm.tz',
      phone: '+255 7XX XXX XXX',
      address: 'Kariakoo, Dar es Salaam'
    },
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '6',
    name: 'Wisdom Gate School',
    location: 'Mogadishu, Somalia',
    country: 'Somalia',
    flag: '🇸🇴',
    students: 45,
    courses: 4,
    rating: 4.5,
    status: 'active',
    joinedDate: '2023-02-15',
    contact: {
      email: 'info@wisdomgate.so',
      phone: '+252 61 XXX XXXX',
      address: 'Hodan, Mogadishu'
    },
    image: 'https://images.unsplash.com/photo-1594312915251-48db9280c8f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '7',
    name: 'Barakah Learning Center',
    location: 'Mombasa, Kenya',
    country: 'Kenya',
    flag: '🇰🇪',
    students: 55,
    courses: 5,
    rating: 4.7,
    status: 'active',
    joinedDate: '2022-08-10',
    contact: {
      email: 'info@barakah.co.ke',
      phone: '+254 7XX XXX XXX',
      address: 'Old Town, Mombasa'
    },
    image: 'https://images.unsplash.com/photo-1568792923760-d70635a89fdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '8',
    name: 'Taqwa Institute',
    location: 'Djibouti City, Djibouti',
    country: 'Djibouti',
    flag: '🇩🇯',
    students: 35,
    courses: 4,
    rating: 4.6,
    status: 'active',
    joinedDate: '2023-05-20',
    contact: {
      email: 'info@taqwa.dj',
      phone: '+253 77 XX XX XX',
      address: 'Central District, Djibouti'
    },
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

// Demo users for authentication
export const demoUsers = {
  student: {
    id: 'student-001',
    email: 'student@tabsera.com',
    password: 'student123',
    name: 'Ahmed Mohamed',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    phone: '+252 63 XXX XXXX',
    centerId: '1',
    centerName: 'Aqoonyahan School',
    enrolledTracks: ['2'],
    enrolledCourses: ['3', '4'],
    completedCourses: ['4'],
    joinedDate: '2023-09-01'
  },
  centerAdmin: {
    id: 'center-001',
    email: 'center@tabsera.com',
    password: 'center123',
    name: 'Fatima Ali',
    role: 'center_admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    phone: '+252 63 XXX XXXX',
    centerId: '1',
    centerName: 'Aqoonyahan School',
    joinedDate: '2021-03-15'
  },
  admin: {
    id: 'admin-001',
    email: 'admin@tabsera.com',
    password: 'admin123',
    name: 'Ibrahim Yusuf',
    role: 'tabsera_admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    phone: '+252 63 XXX XXXX',
    joinedDate: '2019-01-01'
  }
};

// Student enrollments and progress
export const studentEnrollments = [
  {
    id: 'enroll-001',
    studentId: 'student-001',
    type: 'track',
    itemId: '2',
    title: 'Islamic Studies',
    progress: 65,
    startDate: '2023-09-01',
    expectedEndDate: '2024-09-01',
    status: 'in_progress',
    completedLessons: 97,
    totalLessons: 150,
    lastAccessDate: '2024-12-10',
    courses: [
      { id: '3', title: 'Quranic Studies & Tajweed', progress: 75, status: 'in_progress' },
      { id: '4', title: 'Islamic History & Civilization', progress: 100, status: 'completed' }
    ]
  }
];

// Student payments history
export const studentPayments = [
  {
    id: 'pay-001',
    studentId: 'student-001',
    type: 'enrollment',
    description: 'Islamic Studies Track - Full Payment',
    amount: 25.00,
    currency: 'USD',
    status: 'completed',
    date: '2023-09-01',
    method: 'Mobile Money (Zaad)',
    reference: 'TXN-2023-09-001'
  },
  {
    id: 'pay-002',
    studentId: 'student-001',
    type: 'installment',
    description: 'Monthly Installment - October 2023',
    amount: 8.33,
    currency: 'USD',
    status: 'completed',
    date: '2023-10-01',
    method: 'Mobile Money (EVC)',
    reference: 'TXN-2023-10-001'
  },
  {
    id: 'pay-003',
    studentId: 'student-001',
    type: 'installment',
    description: 'Monthly Installment - November 2023',
    amount: 8.33,
    currency: 'USD',
    status: 'completed',
    date: '2023-11-01',
    method: 'Mobile Money (EVC)',
    reference: 'TXN-2023-11-001'
  }
];

// Student certificates
export const studentCertificates = [
  {
    id: 'cert-001',
    studentId: 'student-001',
    courseId: '4',
    courseName: 'Islamic History & Civilization',
    trackName: 'Islamic Studies',
    issueDate: '2024-01-15',
    certificateNumber: 'TABS-2024-IS-0042',
    grade: 'A',
    score: 92,
    validUntil: null,
    downloadUrl: '/certificates/cert-001.pdf'
  }
];

// Admin dashboard data
export const adminDashboardStats = {
  totalStudents: 510,
  activeStudents: 485,
  totalCenters: 8,
  activeCenters: 8,
  totalRevenue: 45680,
  monthlyRevenue: 5420,
  pendingSettlements: 12500,
  completedEnrollments: 1250
};

// Partner settlements data
export const settlements = [
  {
    id: 'settle-001',
    centerId: '1',
    centerName: 'Aqoonyahan School',
    period: 'November 2024',
    grossAmount: 1800,
    tabseraShare: 360,
    centerShare: 1440,
    status: 'pending',
    dueDate: '2024-12-15',
    studentsCount: 60,
    enrollmentsCount: 72
  },
  {
    id: 'settle-002',
    centerId: '2',
    centerName: 'Sunrise International Academy',
    period: 'November 2024',
    grossAmount: 3600,
    tabseraShare: 720,
    centerShare: 2880,
    status: 'pending',
    dueDate: '2024-12-15',
    studentsCount: 120,
    enrollmentsCount: 144
  },
  {
    id: 'settle-003',
    centerId: '1',
    centerName: 'Aqoonyahan School',
    period: 'October 2024',
    grossAmount: 1650,
    tabseraShare: 330,
    centerShare: 1320,
    status: 'completed',
    paidDate: '2024-11-10',
    studentsCount: 55,
    enrollmentsCount: 66
  }
];

// Center revenue data
export const centerRevenueData = {
  centerId: '1',
  currentMonth: {
    revenue: 1800,
    students: 60,
    enrollments: 72,
    pendingPayments: 450
  },
  lastMonth: {
    revenue: 1650,
    students: 55,
    enrollments: 66
  },
  yearToDate: {
    revenue: 18500,
    students: 60,
    totalEnrollments: 180
  },
  monthlyTrend: [
    { month: 'Jan', revenue: 1200 },
    { month: 'Feb', revenue: 1350 },
    { month: 'Mar', revenue: 1400 },
    { month: 'Apr', revenue: 1500 },
    { month: 'May', revenue: 1450 },
    { month: 'Jun', revenue: 1550 },
    { month: 'Jul', revenue: 1600 },
    { month: 'Aug', revenue: 1700 },
    { month: 'Sep', revenue: 1750 },
    { month: 'Oct', revenue: 1650 },
    { month: 'Nov', revenue: 1800 },
    { month: 'Dec', revenue: 1550 }
  ]
};

// Center students data
export const centerStudents = [
  {
    id: 'cs-001',
    name: 'Ahmed Mohamed',
    email: 'ahmed@student.com',
    phone: '+252 63 XXX XXXX',
    enrolledTracks: ['Islamic Studies'],
    enrolledCourses: 2,
    progress: 65,
    status: 'active',
    joinedDate: '2023-09-01',
    lastActive: '2024-12-10',
    totalPaid: 25,
    pendingAmount: 0
  },
  {
    id: 'cs-002',
    name: 'Fatima Hassan',
    email: 'fatima@student.com',
    phone: '+252 63 XXX XXXX',
    enrolledTracks: ['Cambridge IGCSE Full'],
    enrolledCourses: 4,
    progress: 45,
    status: 'active',
    joinedDate: '2023-10-15',
    lastActive: '2024-12-09',
    totalPaid: 60,
    pendingAmount: 20
  },
  {
    id: 'cs-003',
    name: 'Mohamed Abdi',
    email: 'mohamed@student.com',
    phone: '+252 63 XXX XXXX',
    enrolledTracks: ['ESL Intensive'],
    enrolledCourses: 3,
    progress: 80,
    status: 'active',
    joinedDate: '2023-08-01',
    lastActive: '2024-12-11',
    totalPaid: 30,
    pendingAmount: 0
  },
  {
    id: 'cs-004',
    name: 'Amina Yusuf',
    email: 'amina@student.com',
    phone: '+252 63 XXX XXXX',
    enrolledTracks: ['Arabic Language'],
    enrolledCourses: 2,
    progress: 30,
    status: 'active',
    joinedDate: '2024-01-10',
    lastActive: '2024-12-08',
    totalPaid: 35,
    pendingAmount: 0
  },
  {
    id: 'cs-005',
    name: 'Ibrahim Omar',
    email: 'ibrahim@student.com',
    phone: '+252 63 XXX XXXX',
    enrolledTracks: ['Business Track'],
    enrolledCourses: 2,
    progress: 55,
    status: 'active',
    joinedDate: '2023-11-20',
    lastActive: '2024-12-07',
    totalPaid: 45,
    pendingAmount: 0
  }
];

// All users for admin management
export const allUsers = [
  {
    id: 'user-001',
    name: 'Ahmed Mohamed',
    email: 'ahmed@student.com',
    role: 'student',
    status: 'active',
    centerId: '1',
    centerName: 'Aqoonyahan School',
    joinedDate: '2023-09-01',
    lastLogin: '2024-12-10'
  },
  {
    id: 'user-002',
    name: 'Fatima Ali',
    email: 'fatima.ali@aqoonyahan.so',
    role: 'center_admin',
    status: 'active',
    centerId: '1',
    centerName: 'Aqoonyahan School',
    joinedDate: '2021-03-15',
    lastLogin: '2024-12-11'
  },
  {
    id: 'user-003',
    name: 'John Kamau',
    email: 'john@sunrise.co.ke',
    role: 'center_admin',
    status: 'active',
    centerId: '2',
    centerName: 'Sunrise International Academy',
    joinedDate: '2020-09-01',
    lastLogin: '2024-12-10'
  },
  {
    id: 'user-004',
    name: 'Ibrahim Yusuf',
    email: 'admin@tabsera.com',
    role: 'tabsera_admin',
    status: 'active',
    centerId: null,
    centerName: null,
    joinedDate: '2019-01-01',
    lastLogin: '2024-12-11'
  }
];

// Partner applications
export const partnerApplications = [
  {
    id: 'app-001',
    institutionName: 'Al-Hikma Academy',
    location: 'Kigali, Rwanda',
    country: 'Rwanda',
    contactName: 'Jean Pierre Habimana',
    contactEmail: 'jp@alhikma.rw',
    contactPhone: '+250 78 XXX XXXX',
    studentCapacity: 100,
    currentStudents: 75,
    status: 'pending',
    submittedDate: '2024-11-28',
    message: 'We are interested in offering Islamic Studies and Arabic Language tracks to our students.'
  },
  {
    id: 'app-002',
    institutionName: 'Noor Education Center',
    location: 'Khartoum, Sudan',
    country: 'Sudan',
    contactName: 'Dr. Osman Ahmed',
    contactEmail: 'osman@nooredu.sd',
    contactPhone: '+249 9XX XXX XXX',
    studentCapacity: 150,
    currentStudents: 120,
    status: 'under_review',
    submittedDate: '2024-11-15',
    message: 'Looking to partner for the full Cambridge IGCSE program.'
  },
  {
    id: 'app-003',
    institutionName: 'Madina Learning Hub',
    location: 'Lagos, Nigeria',
    country: 'Nigeria',
    contactName: 'Aisha Bello',
    contactEmail: 'aisha@madina.ng',
    contactPhone: '+234 8XX XXX XXXX',
    studentCapacity: 200,
    currentStudents: 180,
    status: 'approved',
    submittedDate: '2024-10-20',
    approvedDate: '2024-11-05',
    message: 'We want to expand our Islamic education offerings with TABSERA tracks.'
  }
];

// Recent activity for dashboards
export const recentActivity = [
  {
    id: 'act-001',
    type: 'enrollment',
    message: 'New student enrolled in Islamic Studies track',
    user: 'Ahmed Mohamed',
    center: 'Aqoonyahan School',
    timestamp: '2024-12-11T10:30:00Z'
  },
  {
    id: 'act-002',
    type: 'completion',
    message: 'Student completed Quranic Studies course',
    user: 'Fatima Hassan',
    center: 'Sunrise Academy',
    timestamp: '2024-12-11T09:15:00Z'
  },
  {
    id: 'act-003',
    type: 'payment',
    message: 'Payment received for IGCSE Mathematics',
    user: 'Ibrahim Omar',
    center: 'Excel Academy',
    timestamp: '2024-12-10T16:45:00Z'
  },
  {
    id: 'act-004',
    type: 'certificate',
    message: 'Certificate issued for Islamic History',
    user: 'Amina Yusuf',
    center: 'Al-Noor Center',
    timestamp: '2024-12-10T14:20:00Z'
  },
  {
    id: 'act-005',
    type: 'partner',
    message: 'New partner application received',
    user: 'Al-Hikma Academy',
    center: 'Rwanda',
    timestamp: '2024-12-10T11:00:00Z'
  }
];

// Promo codes
export const promoCodes = {
  'WELCOME10': { discount: 10, type: 'percentage', minPurchase: 0, validUntil: '2025-12-31' },
  'SAVE20': { discount: 20, type: 'percentage', minPurchase: 50, validUntil: '2025-06-30' },
  'STUDENT15': { discount: 15, type: 'percentage', minPurchase: 0, validUntil: '2025-12-31' },
  'RAMADAN25': { discount: 25, type: 'percentage', minPurchase: 30, validUntil: '2025-04-30' },
  'FLAT5': { discount: 5, type: 'fixed', minPurchase: 20, validUntil: '2025-12-31' }
};

// Course curriculum/lessons structure
export const courseCurriculum = {
  '3': { // Quranic Studies & Tajweed
    modules: [
      {
        id: 'mod-1',
        title: 'Introduction to Tajweed',
        lessons: [
          { id: 'les-1-1', title: 'What is Tajweed?', duration: '15 min', type: 'video', completed: true },
          { id: 'les-1-2', title: 'Importance of Proper Recitation', duration: '20 min', type: 'video', completed: true },
          { id: 'les-1-3', title: 'Arabic Alphabet Review', duration: '30 min', type: 'video', completed: true },
          { id: 'les-1-4', title: 'Module 1 Quiz', duration: '15 min', type: 'quiz', completed: true }
        ]
      },
      {
        id: 'mod-2',
        title: 'Makharij al-Huruf (Articulation Points)',
        lessons: [
          { id: 'les-2-1', title: 'Throat Letters', duration: '25 min', type: 'video', completed: true },
          { id: 'les-2-2', title: 'Tongue Letters', duration: '30 min', type: 'video', completed: true },
          { id: 'les-2-3', title: 'Lip Letters', duration: '20 min', type: 'video', completed: false },
          { id: 'les-2-4', title: 'Practice Session', duration: '45 min', type: 'practice', completed: false },
          { id: 'les-2-5', title: 'Module 2 Quiz', duration: '20 min', type: 'quiz', completed: false }
        ]
      },
      {
        id: 'mod-3',
        title: 'Rules of Noon Saakin and Tanween',
        lessons: [
          { id: 'les-3-1', title: 'Izhar (Clarity)', duration: '25 min', type: 'video', completed: false },
          { id: 'les-3-2', title: 'Idgham (Merging)', duration: '30 min', type: 'video', completed: false },
          { id: 'les-3-3', title: 'Iqlab (Conversion)', duration: '20 min', type: 'video', completed: false },
          { id: 'les-3-4', title: 'Ikhfa (Concealment)', duration: '25 min', type: 'video', completed: false },
          { id: 'les-3-5', title: 'Practice with Surah Al-Fatiha', duration: '40 min', type: 'practice', completed: false }
        ]
      }
    ]
  }
};

// Helper function to get course by ID
export const getCourseById = (id) => courses.find(c => c.id === id);

// Helper function to get track by ID
export const getTrackById = (id) => tracks.find(t => t.id === id);

// Helper function to get center by ID
export const getCenterById = (id) => learningCenters.find(c => c.id === id);

// Helper function to get courses by track
export const getCoursesByTrack = (trackId) => courses.filter(c => c.trackId === trackId);

// Helper function to validate promo code
export const validatePromoCode = (code, cartTotal) => {
  const promo = promoCodes[code.toUpperCase()];
  if (!promo) return { valid: false, message: 'Invalid promo code' };

  const now = new Date();
  const validUntil = new Date(promo.validUntil);
  if (now > validUntil) return { valid: false, message: 'Promo code has expired' };

  if (cartTotal < promo.minPurchase) {
    return { valid: false, message: `Minimum purchase of $${promo.minPurchase} required` };
  }

  return { valid: true, promo };
};

// Helper function to calculate discount
export const calculateDiscount = (promo, cartTotal) => {
  if (promo.type === 'percentage') {
    return (cartTotal * promo.discount) / 100;
  }
  return promo.discount;
};
