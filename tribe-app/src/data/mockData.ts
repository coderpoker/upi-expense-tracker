// =============================================
// Tribe — Mock Data for MVP Development
// =============================================

export interface Event {
  id: string;
  title: string;
  emoji: string;
  description: string;
  category: 'social' | 'active' | 'creative' | 'gaming' | 'food' | 'learning';
  locationName: string;
  area: string;
  dateTime: string;
  dayLabel: string;
  timeLabel: string;
  maxCapacity: number;
  currentMembers: number;
  hostName: string;
  hostAvatar: string;
  imageUrl?: string;
  price: number;
  source: 'partner' | 'user' | 'external';
  slug: string;
}

export interface VibeOption {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
}

export const VIBE_OPTIONS: VibeOption[] = [
  { id: 'move', emoji: '🏃', title: 'Move & Groove', subtitle: 'Running, hiking, sports' },
  { id: 'chill', emoji: '☕', title: 'Chill & Chat', subtitle: 'Cafes, books, deep talks' },
  { id: 'create', emoji: '🎨', title: 'Make & Create', subtitle: 'Art, pottery, cooking' },
  { id: 'game', emoji: '🎮', title: 'Play & Compete', subtitle: 'Board games, trivia, gaming' },
  { id: 'explore', emoji: '🧭', title: 'Explore & Wander', subtitle: 'Street food, walks, city tours' },
  { id: 'learn', emoji: '📚', title: 'Grow & Learn', subtitle: 'Workshops, skill-sharing, talks' },
];

export const INTEREST_TAGS = [
  '☕ Coffee', '🏃 Running', '🎨 Art', '📚 Reading', '🎮 Gaming',
  '🍕 Foodie', '🎵 Music', '🧘 Yoga', '🎬 Movies', '🌿 Nature',
  '💻 Tech', '📷 Photography', '🎸 Live Music', '🏸 Badminton',
  '🧗 Climbing', '🎭 Improv', '✍️ Writing', '🍳 Cooking',
];

export const CATEGORY_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  social: { emoji: '☕', label: 'Social', color: '#FBBF24' },
  active: { emoji: '🏃', label: 'Active', color: '#34D399' },
  creative: { emoji: '🎨', label: 'Creative', color: '#A78BFA' },
  gaming: { emoji: '🎮', label: 'Gaming', color: '#60A5FA' },
  food: { emoji: '🍕', label: 'Food', color: '#FB923C' },
  learning: { emoji: '📚', label: 'Learning', color: '#F472B6' },
};

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Pottery & Pour',
    emoji: '🎨',
    description: 'Get your hands dirty at a beginner-friendly pottery session. Clay, wheel, and good vibes included. No experience needed — just curiosity and clean clothes (optional).',
    category: 'creative',
    locationName: 'The Clay Studio',
    area: 'Koramangala',
    dateTime: '2026-04-05T16:00:00',
    dayLabel: 'Sat, Apr 5',
    timeLabel: '4:00 PM',
    maxCapacity: 6,
    currentMembers: 3,
    hostName: 'The Clay Studio',
    hostAvatar: '🏺',
    price: 0,
    source: 'partner',
    slug: 'pottery-pour-apr5',
  },
  {
    id: '2',
    title: 'Sunrise Run Club',
    emoji: '🌅',
    description: 'Easy-paced 5K run through Cubbon Park followed by cold brew at Third Wave. All fitness levels welcome. Just show up and run (or walk, we don\'t judge).',
    category: 'active',
    locationName: 'Cubbon Park Main Gate',
    area: 'Cubbon Park',
    dateTime: '2026-04-06T06:00:00',
    dayLabel: 'Sun, Apr 6',
    timeLabel: '6:00 AM',
    maxCapacity: 8,
    currentMembers: 5,
    hostName: 'Shrey J.',
    hostAvatar: '🏃',
    price: 0,
    source: 'user',
    slug: 'sunrise-run-apr6',
  },
  {
    id: '3',
    title: 'Board Game Cafe',
    emoji: '🎲',
    description: 'Settlers of Catan, Codenames, Exploding Kittens — pick your poison. Snacks and drinks on the house (well, on the cafe). Perfect for introverts who want to be social without the small talk.',
    category: 'gaming',
    locationName: 'Dice & Dine',
    area: 'Indiranagar',
    dateTime: '2026-04-05T18:00:00',
    dayLabel: 'Sat, Apr 5',
    timeLabel: '6:00 PM',
    maxCapacity: 6,
    currentMembers: 2,
    hostName: 'Dice & Dine',
    hostAvatar: '🎲',
    price: 0,
    source: 'partner',
    slug: 'board-game-apr5',
  },
  {
    id: '4',
    title: 'Street Food Crawl',
    emoji: '🍜',
    description: 'A guided walk through VV Puram food street. Taste dosas, chaats, and desserts from the best stalls. Come hungry, leave happy (and maybe slightly bloated).',
    category: 'food',
    locationName: 'VV Puram Food Street',
    area: 'VV Puram',
    dateTime: '2026-04-06T17:00:00',
    dayLabel: 'Sun, Apr 6',
    timeLabel: '5:00 PM',
    maxCapacity: 6,
    currentMembers: 4,
    hostName: 'Foodie Walks BLR',
    hostAvatar: '🍜',
    price: 200,
    source: 'external',
    slug: 'street-food-apr6',
  },
  {
    id: '5',
    title: 'Silent Reading Club',
    emoji: '📖',
    description: 'Bring a book. Sit in a beautiful cafe. Read for 45 minutes. Then chat about what you\'re reading over masala chai. The most introverted-friendly social event ever created.',
    category: 'social',
    locationName: 'Atta Galatta Bookstore',
    area: 'Koramangala',
    dateTime: '2026-04-05T10:00:00',
    dayLabel: 'Sat, Apr 5',
    timeLabel: '10:00 AM',
    maxCapacity: 5,
    currentMembers: 1,
    hostName: 'Atta Galatta',
    hostAvatar: '📚',
    price: 0,
    source: 'partner',
    slug: 'silent-reading-apr5',
  },
  {
    id: '6',
    title: 'Sketch & Sip',
    emoji: '✏️',
    description: 'Guided urban sketching session at Lalbagh. All materials provided. No artistic talent required — just a willingness to draw something that might look like a wonky tree.',
    category: 'creative',
    locationName: 'Lalbagh Botanical Garden',
    area: 'Lalbagh',
    dateTime: '2026-04-06T09:00:00',
    dayLabel: 'Sun, Apr 6',
    timeLabel: '9:00 AM',
    maxCapacity: 6,
    currentMembers: 3,
    hostName: 'Sketch Club BLR',
    hostAvatar: '✏️',
    price: 150,
    source: 'user',
    slug: 'sketch-sip-apr6',
  },
];
