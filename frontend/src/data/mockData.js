export const CAMPAIGNS = [
  {
    id: "1", slug: "flood-relief-sylhet",
    title: "Sylhet Flood Relief for 500 Families",
    organizer: "Rahman Foundation", orgVerified: true,
    category: "Disaster Relief",
    description: "Devastating floods have displaced over 500 families across Sylhet. Your donation provides emergency food packages, clean drinking water, and temporary shelter materials directly to affected households.",
    story: "The floods came suddenly. Families had minutes to escape. Farida Begum, a mother of four, lost everything—her home, her sewing machine, her children's school books. She is one of thousands. With your help, we can reach her.\n\nFunds are distributed through our verified local partner network. Every taka is tracked and publicly reported.",
    raised: 285000, goal: 500000, donors: 142, daysLeft: 18,
    color: "#2D6A4F", emoji: "🌊",
  },
  {
    id: "2", slug: "rohingya-children-education",
    title: "Education for 200 Rohingya Children",
    organizer: "Hope for Tomorrow NGO", orgVerified: true,
    category: "Education",
    description: "Supporting 200 Rohingya children in Cox's Bazar camps with quality education, learning materials, and trained teachers.",
    story: "In the crowded camps of Cox's Bazar, children are growing up without schooling. Mohammad Iqbal, age 9, has never attended a class. Our mobile school program has already reached 80 children—with your support, we can double that.\n\nFunds cover: teacher salaries, printed books, stationery, and safe learning space rental.",
    raised: 145000, goal: 300000, donors: 89, daysLeft: 35,
    color: "#1B4F72", emoji: "📚",
  },
  {
    id: "3", slug: "baby-ayesha-heart-surgery",
    title: "Urgent Heart Surgery for Baby Ayesha",
    organizer: "Karim Family", orgVerified: false,
    category: "Medical",
    description: "8-month-old Ayesha needs urgent open-heart surgery. Her family cannot afford the ৳8 lakh treatment cost.",
    story: "Ayesha was born with a hole in her heart. Without surgery within the next few weeks, doctors say her chances drop significantly. Her father drives a rickshaw—the family has no savings.\n\nAll funds go directly to Square Hospital, Dhaka. Hospital invoice is available for download.",
    raised: 420000, goal: 800000, donors: 267, daysLeft: 7,
    color: "#922B21", emoji: "💗",
  },
  {
    id: "4", slug: "clean-water-char-islands",
    title: "Clean Water for 3 Char Island Communities",
    organizer: "WaterAid Bangladesh", orgVerified: true,
    category: "Community",
    description: "Installing 15 tube wells and water purification systems for remote char islands where families walk 3km for water.",
    story: "On the char islands of the Brahmaputra, clean water is a luxury. Women wake before dawn to collect water from contaminated sources.\n\nOur engineering team has already surveyed the sites. Funding unlocks installation within 30 days.",
    raised: 95000, goal: 250000, donors: 54, daysLeft: 45,
    color: "#1F618D", emoji: "💧",
  },
  {
    id: "5", slug: "women-entrepreneur-fund",
    title: "Micro-Loan Fund for Rural Women Entrepreneurs",
    organizer: "Unnayan Collective", orgVerified: true,
    category: "Livelihood",
    description: "Zero-interest micro-loans for 50 women starting small businesses in rural Rajshahi.",
    story: "Across rural Rajshahi, women with ideas and drive lack only capital. Our revolving micro-loan fund has helped 120 women so far.\n\nEvery repaid loan is recycled to fund the next entrepreneur.",
    raised: 62000, goal: 200000, donors: 38, daysLeft: 60,
    color: "#6C3483", emoji: "🌱",
  },
  {
    id: "6", slug: "school-rebuild-mymensingh",
    title: "Rebuild Our Primary School – Mymensingh",
    organizer: "Gurudayal Community", orgVerified: false,
    category: "Education",
    description: "A cyclone destroyed the only school for 300 children in our village. Help us rebuild.",
    story: "Our school stood for 40 years before the cyclone tore through. 300 children now study under temporary tarps.\n\nLocal contractors have provided quotes. Your donation goes directly to materials and labor.",
    raised: 180000, goal: 350000, donors: 115, daysLeft: 22,
    color: "#B7950B", emoji: "🏫",
  },
];

export const CATEGORIES = ["All", "Disaster Relief", "Education", "Medical", "Community", "Livelihood"];

export const CAMPAIGN_COLORS = {
  Medical: "#922B21",
  Education: "#1B4F72",
  "Disaster Relief": "#2D6A4F",
  Community: "#1F618D",
  Livelihood: "#6C3483",
};

export const CAMPAIGN_EMOJIS = {
  Medical: "💗",
  Education: "📚",
  "Disaster Relief": "🌊",
  Community: "💧",
  Livelihood: "🌱",
};