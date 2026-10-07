// Edit everything about your site here.

export const SITE = {
  name: 'Jeetendra Mishra',
  role: 'Senior Software Developer',
  intro:
    'I build secure, high-volume payment systems with Java, Spring Boot and microservices, from merchant onboarding and authentication to transaction processing.',
  email: '', // add your email, e.g. 'jeetendra@example.com'
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jeetmishra60/' },
    { label: 'GitHub', href: '' }, // add your GitHub link, or leave empty to hide
    { label: 'Resume', href: '' }, // put resume.pdf in /public and set '/resume.pdf'
  ],
  about: [
    "I'm a backend developer with over four years in fintech. I started as a trainee at Safexpay in 2022 working on a payment gateway, built transaction data and reporting systems at Touras, and now lead onboarding and authentication work at SecurePay.",
    'I care about the parts that keep payments running: clean APIs, fast queries, safe authentication and calm production support. I also enjoy code reviews and mentoring junior developers.',
  ],
  facts: ['4+ years in fintech', 'Currently at SecurePay', 'Based in Dehradun'],
  skillGroups: [
    { name: 'Backend', items: ['Java', 'Spring Boot', 'Spring MVC', 'Microservices', 'REST APIs', 'Kafka'] },
    { name: 'Data', items: ['MongoDB', 'MySQL', 'Stored procedures', 'Query tuning and indexing'] },
    { name: 'Security and cloud', items: ['JWT and refresh tokens', 'Role-based access', 'OTP verification', 'AWS'] },
    { name: 'Payments', items: ['BBPS', 'Payment gateways', 'Aadhaar, PAN and GST checks', 'eSign', 'Payouts'] },
  ],
  projects: [
    {
      title: 'BBPS mobile portal',
      summary:
        'Built 15+ REST APIs for onboarding and authentication, with OTP verification, JWT, refresh token rotation and role-based access control.',
      stack: ['Spring Boot', 'MongoDB', 'JWT'],
      href: '',
    },
    {
      title: 'Merchant onboarding and verification',
      summary:
        'Aadhaar, PAN, GST, bank verification and eSign integrations, plus the review and approval workflow that takes a merchant from sign-up to live.',
      stack: ['Spring Boot', 'MongoDB', 'MySQL', 'Kafka'],
      href: '',
    },
    {
      title: 'Payout and fraud detection data layer',
      summary:
        'Designed schemas and tuned SQL for real-time, high-volume transactions, and automated daily merchant reports with scheduled jobs.',
      stack: ['MySQL', 'Stored procedures', 'MongoDB'],
      href: '',
    },
    {
      title: 'Payment gateway platform',
      summary:
        'Built RESTful APIs for external integrations and improved transaction processing in a fintech payment gateway.',
      stack: ['Java', 'Spring MVC', 'SQL', 'MongoDB'],
      href: '',
    },
  ],
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'SecurePay',
      dates: 'Sep 2025 to present',
      place: 'Dehradun',
      summary:
        'Onboarding, authentication and verification systems. Leads production issue resolution, performance work and code reviews, and mentors junior developers.',
    },
    {
      role: 'Software Developer',
      company: 'Touras',
      dates: 'Nov 2024 to Aug 2025',
      place: 'Mumbai',
      summary:
        'Optimized SQL and stored procedures for real-time transaction data, payout and fraud detection schemas, and a hybrid SQL and MongoDB setup for API logging.',
    },
    {
      role: 'Software Developer',
      company: 'Safexpay',
      dates: 'Oct 2023 to Oct 2024',
      place: 'Thane',
      summary: 'Payment gateway development, production support and incident response.',
    },
    {
      role: 'Trainee Software Developer',
      company: 'Safexpay',
      dates: 'Apr 2022 to Oct 2023',
      place: 'Thane',
      summary:
        'Java and Spring MVC applications, RESTful APIs for external services, and SQL and MongoDB data work for the payment gateway.',
    },
  ],
};

export const HERO = {
  basePath: '/frames', // frames live in public/frames/<segment>/0001.webp
  fps: 20, // must match the fps used in the ffmpeg command
  alt: 'Animated character working on a laptop, who waves hello when you move to the center',

  // count = number of frames in each folder. Set to 0 if you don't have that clip.
  segments: {
    idle: { count: 320 },
    greet: { count: 160, holdMs: 1500 }, // holds the final pointing pose, then fades to idle
    left: { count: 0, endsAtIdle: true }, // add later: clip that looks left and comes back
    right: { count: 0, endsAtIdle: true },
  },

  // 'pingpong' plays idle forward then backward, which hides a jump if the clip
  // doesn't end in the same pose it started in. Use 'loop' if it already loops cleanly.
  idleLoop: 'pingpong',

  zones: { left: 0.35, right: 0.65 }, // cursor X as a fraction of the hero width
  zoneDebounceMs: 150,
  greetCooldownMs: 5000,
  fadeMs: 450,

  // Sound plays with the greeting only after the visitor turns it on (browsers block
  // sound until someone clicks). Set src to '' to hide the sound button.
  sound: { src: '/greet.mp3', volume: 0.8 },
};
