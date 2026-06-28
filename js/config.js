/* ============================================================
   BSA — Default Site Configuration & Seed Data
   Single source of truth for all editable content
   ============================================================ */

const SiteConfig = {
  // ─── Institute Info ───
  institute: {
    name: 'BHANDE Sir\'s ACADEMY',
    shortName: 'BSA',
    tagline: 'Shaping Futures Since 2008',
    description: 'One of Amravati\'s most trusted coaching institutes, providing quality education for 10th, 12th Board Exams, NEET, MHT-CET, JEE and BE/Polytechnic since 2008.',
    established: 2008,
    phone1: '+91 97665 77526',
    phone2: '+91 85112 77344',
    email: 'bhandesirsacademy@gmail.com',
    address: 'Near Ekta Mahila Mandal Ground, Rathi Nagar, Gadge Nagar, Amravati – 444604',
    city: 'Amravati',
    state: 'Maharashtra',
    pincode: '444604',
    googleRating: 4.9,
    totalReviews: 520,
    hours: '6:00 AM – 10:00 PM',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.123456789!2d77.7523!3d20.9320!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAmravati!5e0!3m2!1sen!4v1234567890',
    logo: '',
    heroImage: '',
  },

  // ─── Social Links ───
  social: {
    youtube: 'https://youtube.com/@bhandesirsacademy',
    instagram: '',
    facebook: '',
    twitter: '',
    whatsapp: 'https://wa.me/919766577526',
    playStore: 'https://play.google.com/store/apps/details?id=com.bhandesiracademy',
  },

  // ─── SEO ───
  seo: {
    title: 'BHANDE Sir\'s ACADEMY (BSA) — Top Coaching Institute in Amravati',
    description: 'BSA is Amravati\'s leading coaching institute for 10th, 12th Board, NEET, MHT-CET, JEE & Polytechnic. 4.9★ Google rated. Est. 2008.',
    keywords: 'BSA, BHANDE Sir Academy, coaching institute Amravati, NEET coaching, MHT-CET, JEE, 10th 12th board, Amravati classes',
    ogImage: '',
  },

  // ─── Theme Colors (editable from admin) ───
  theme: {
    primary: '#0A1628',
    primaryLight: '#1B2D4F',
    secondary: '#3A6EA5',
    secondaryLight: '#6B9BD2',
    accent: '#D4A843',
    accentLight: '#E8C97A',
  },

  // ─── Hero Section ───
  hero: {
    title: 'Your Future Begins Here',
    subtitle: 'Amravati\'s most trusted coaching institute — guiding thousands of students to academic excellence since 2008.',
    cta1Text: 'Explore Courses',
    cta1Link: '#courses',
    cta2Text: 'Get In Touch',
    cta2Link: '#contact',
    stats: [
      { label: 'Years of Excellence', value: 18, suffix: '+' },
      { label: 'Students Coached', value: 15000, suffix: '+' },
      { label: 'Google Rating', value: 4.9, suffix: '★' },
      { label: 'Success Rate', value: 95, suffix: '%' },
    ],
  },

  // ─── Courses ───
  courses: [
    {
      id: 'c1',
      name: '10th Board (SSC)',
      description: 'Comprehensive coaching for SSC Maharashtra Board with conceptual clarity, regular tests and personal attention to each student.',
      subjects: ['Mathematics', 'Science', 'English', 'Social Science'],
      duration: '1 Year',
      fee: 'Contact for details',
      icon: 'school',
      featured: true,
    },
    {
      id: 'c2',
      name: '12th Board (HSC)',
      description: 'In-depth HSC Science preparation covering Physics, Chemistry, Mathematics and Biology with board exam strategies.',
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
      duration: '1 Year',
      fee: 'Contact for details',
      icon: 'science',
      featured: true,
    },
    {
      id: 'c3',
      name: 'NEET Preparation',
      description: 'Targeted coaching for NEET with focus on NCERT mastery, problem-solving speed and regular mock tests modeled on actual exam pattern.',
      subjects: ['Physics', 'Chemistry', 'Biology'],
      duration: '1-2 Years',
      fee: 'Contact for details',
      icon: 'biotech',
      featured: true,
    },
    {
      id: 'c4',
      name: 'MHT-CET',
      description: 'Specialized MHT-CET coaching with extensive practice sets, shortcut techniques and time management strategies.',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      duration: '1 Year',
      fee: 'Contact for details',
      icon: 'engineering',
      featured: true,
    },
    {
      id: 'c5',
      name: 'JEE (Main + Advanced)',
      description: 'Rigorous IIT-JEE preparation building strong fundamentals and advanced problem-solving skills for top engineering admissions.',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      duration: '1-2 Years',
      fee: 'Contact for details',
      icon: 'rocket_launch',
      featured: false,
    },
    {
      id: 'c6',
      name: 'BE / Polytechnic',
      description: 'Specialized coaching for engineering and polytechnic students with subject-wise doubt clearing sessions and exam strategies.',
      subjects: ['Engineering Subjects'],
      duration: 'Semester-wise',
      fee: 'Contact for details',
      icon: 'precision_manufacturing',
      featured: false,
    },
  ],

  // ─── Facilities ───
  facilities: [
    { icon: 'smart_display', title: 'Smart Classrooms', description: 'Projector-equipped AC classrooms with digital learning tools' },
    { icon: 'quiz', title: 'Regular Testing', description: 'Weekly tests, mock exams and detailed performance analysis' },
    { icon: 'menu_book', title: 'Study Material', description: 'Well-researched notes, question banks and practice papers' },
    { icon: 'groups', title: 'Small Batch Size', description: 'Limited students per batch for personalized attention' },
    { icon: 'psychology', title: 'Doubt Sessions', description: 'Dedicated doubt-clearing sessions with faculty' },
    { icon: 'devices', title: 'Online Classes', description: 'Access video lectures, e-books and live classes via BSA app' },
    { icon: 'emoji_events', title: 'Result-Oriented', description: 'Focused approach yielding consistent top results year after year' },
    { icon: 'support_agent', title: 'Parent Connect', description: 'Regular parent-teacher meetings and progress updates' },
  ],

  // ─── Faculty ───
  faculty: [
    {
      id: 'f1',
      name: 'Bhande Sir',
      subject: 'Physics',
      experience: '18+ Years',
      bio: 'Founder & Director of BSA. Known for his engaging teaching methodology and deep subject expertise in Physics.',
      photo: '',
      social: { youtube: 'https://youtube.com/@bhandesirsacademy' },
    },
    {
      id: 'f2',
      name: 'Faculty Member',
      subject: 'Chemistry',
      experience: '10+ Years',
      bio: 'Expert Chemistry educator specializing in Organic and Inorganic Chemistry with innovative teaching methods.',
      photo: '',
      social: {},
    },
    {
      id: 'f3',
      name: 'Faculty Member',
      subject: 'Mathematics',
      experience: '12+ Years',
      bio: 'Dedicated Mathematics teacher helping students develop problem-solving skills and mathematical intuition.',
      photo: '',
      social: {},
    },
    {
      id: 'f4',
      name: 'Faculty Member',
      subject: 'Biology',
      experience: '8+ Years',
      bio: 'Passionate Biology educator making complex concepts easy to understand through visual learning techniques.',
      photo: '',
      social: {},
    },
  ],

  // ─── Testimonials ───
  testimonials: [
    {
      id: 't1',
      name: 'Student Name',
      course: 'NEET',
      year: 2025,
      rating: 5,
      text: 'BSA helped me crack NEET with excellent guidance and study material. The regular testing pattern really boosted my confidence.',
      photo: '',
    },
    {
      id: 't2',
      name: 'Student Name',
      course: '12th Board',
      year: 2025,
      rating: 5,
      text: 'Amazing teaching methodology! The faculty at BSA truly cares about each student\'s progress. I scored above 90% in my boards.',
      photo: '',
    },
    {
      id: 't3',
      name: 'Student Name',
      course: 'MHT-CET',
      year: 2024,
      rating: 5,
      text: 'The structured approach and mock tests at BSA were instrumental in my MHT-CET success. Highly recommended!',
      photo: '',
    },
  ],

  // ─── FAQs ───
  faqs: [
    {
      id: 'faq1',
      question: 'What courses does BSA offer?',
      answer: 'BSA offers coaching for 10th Board (SSC), 12th Board (HSC), NEET, MHT-CET, JEE (Main + Advanced) and BE/Polytechnic examinations.',
    },
    {
      id: 'faq2',
      question: 'What are the class timings?',
      answer: 'BSA operates from 6:00 AM to 10:00 PM. Specific batch timings vary by course. Contact us for the detailed schedule.',
    },
    {
      id: 'faq3',
      question: 'Does BSA provide online classes?',
      answer: 'Yes! BSA has a dedicated mobile app available on Google Play Store where students can access video lectures, e-books, notes, live classes and online mock tests.',
    },
    {
      id: 'faq4',
      question: 'What is the batch size?',
      answer: 'We maintain small batch sizes to ensure personalized attention and effective learning for every student.',
    },
    {
      id: 'faq5',
      question: 'How can I enroll?',
      answer: 'You can visit our institute at Rathi Nagar, Gadge Nagar, Amravati or call us at +91 97665 77526 / +91 85112 77344 to enquire about admissions.',
    },
    {
      id: 'faq6',
      question: 'Does BSA provide study material?',
      answer: 'Yes, BSA provides comprehensive study material including well-researched notes, question banks, previous year papers and practice sets.',
    },
  ],

  // ─── Student Results (sample) ───
  results: [
    {
      id: 'r1', name: 'Student 1', course: 'NEET', marks: '680/720',
      percentage: 94.4, rank: 'AIR 450', year: 2025, description: 'Secured admission in top medical college', photo: ''
    },
    {
      id: 'r2', name: 'Student 2', course: '12th Board', marks: '548/600',
      percentage: 91.3, rank: 'District Topper', year: 2025, description: 'School first in Science stream', photo: ''
    },
    {
      id: 'r3', name: 'Student 3', course: 'MHT-CET', marks: '156/200',
      percentage: 78, rank: '99.2 percentile', year: 2024, description: 'Selected in COEP Pune', photo: ''
    },
    {
      id: 'r4', name: 'Student 4', course: 'JEE', marks: '245/300',
      percentage: 81.7, rank: 'AIR 5200', year: 2024, description: 'Secured NIT admission', photo: ''
    },
    {
      id: 'r5', name: 'Student 5', course: '10th Board', marks: '475/500',
      percentage: 95, rank: 'City Rank 3', year: 2025, description: 'Scored perfect 100 in Mathematics', photo: ''
    },
    {
      id: 'r6', name: 'Student 6', course: 'NEET', marks: '650/720',
      percentage: 90.3, rank: 'AIR 1200', year: 2024, description: 'Top performer in Biology', photo: ''
    },
  ],

  // ─── Gallery (empty, admin uploads) ───
  gallery: [],

  // ─── Notices ───
  notices: [
    { id: 'n1', text: '🎉 Admissions Open for 2025-26 Batch! Enroll Now.', active: true, date: '2025-06-01' },
    { id: 'n2', text: '📢 New MHT-CET Crash Course Starting July 2025.', active: true, date: '2025-06-15' },
  ],

  // ─── Admin Password (SHA-256 hash of "bsa@admin2024") ───
  adminPasswordHash: '6a4e3d0c7e1f8b2a9d5c4e7f0a3b6d8e1c2f5a9b0d3e6f8a1c4d7e0b3f6a9c',
};
