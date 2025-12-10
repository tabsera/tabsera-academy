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
