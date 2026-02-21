// Mock blog dataset – travel-themed demo content

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: Author;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  sections: Section[];
  gallery: GalleryImage[];
  coordinate: {
    lat: number;
    lng: number;
    label: string;
  };
  places: BlogPlace[];
  countryCode: string;
  countryName: string;
}

export interface Author {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  posts: number;
}

export interface Section {
  type: "heading" | "paragraph" | "quote" | "code" | "list";
  content: string;
  items?: string[];
  language?: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
}

export interface BlogPlace {
  id: string;
  name: string;
  description: string;
  coordinate: { lat: number; lng: number };
  photos: string[];
}

export const demoAuthor: Author = {
  username: "demo",
  name: "Sofia Nakamura",
  avatar: "https://picsum.photos/seed/sofia/200/200",
  bio: "Travel blogger & photographer. Chasing golden hours across 40+ countries. Sharing honest travel stories, hidden gems, and the moments that make wandering worth it.",
  followers: 12480,
  posts: 9,
};

export const mockBlogs: BlogPost[] = [
  // ─── Japan (2025) ───────────────────────────────────────────────
  {
    slug: "tokyo-neon-dreams",
    title: "Tokyo Neon Dreams: A Week in the World's Greatest City",
    excerpt:
      "From the electric chaos of Shibuya to the serenity of Yanaka's temple lanes — Tokyo delivers everything at once, and I can't stop thinking about going back.",
    coverImage: "https://picsum.photos/seed/tokyo-cover/1200/630",
    author: demoAuthor,
    publishedAt: "2025-04-12",
    readingTime: 8,
    tags: ["Japan", "Tokyo", "Asia", "City Life"],
    countryCode: "JP",
    countryName: "Japan",
    coordinate: { lat: 35.6762, lng: 139.6503, label: "Tokyo, Japan" },
    sections: [
      {
        type: "paragraph",
        content:
          "Tokyo overwhelms you in the best possible way. The scale is incomprehensible until you're standing underneath a 10-story video screen in Shinjuku at midnight, sipping a canned coffee, feeling impossibly small and completely alive.",
      },
      { type: "heading", content: "Shibuya Crossing at Midnight" },
      {
        type: "paragraph",
        content:
          "The famous crossing is even more dramatic at night. Hundreds of people surge across from every direction simultaneously — and yet somehow, nobody collides. It's choreographed chaos at its finest.",
      },
      {
        type: "quote",
        content:
          "In Tokyo, you don't sightsee. You just wander, and the city hands you stories.",
      },
      { type: "heading", content: "Yanaka — Old Tokyo Survives" },
      {
        type: "paragraph",
        content:
          "Hidden from most tourists, Yanaka is a neighborhood that survived WWII and feels like it. Walk the shotengai (old shopping street), eat taiyaki from a street cart, and lose an hour in the old cemetery.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/tokyo-shibuya/800/500",
        alt: "Shibuya Crossing",
        caption: "Shibuya Crossing at golden hour",
      },
      {
        src: "https://picsum.photos/seed/tokyo-temple/800/500",
        alt: "Tokyo temple",
        caption: "Morning quiet at Senso-ji, Asakusa",
      },
      {
        src: "https://picsum.photos/seed/tokyo-food/800/500",
        alt: "Ramen bowl",
        caption: "Late-night ramen in Shinjuku",
      },
    ],
    places: [
      {
        id: "shibuya-crossing",
        name: "Shibuya Crossing",
        description:
          "The world's most famous pedestrian crossing. Best experienced at rush hour from the Starbucks overlooking it.",
        coordinate: { lat: 35.6595, lng: 139.7004 },
        photos: [
          "https://picsum.photos/seed/tok-shibuya/800/500",
          "https://picsum.photos/seed/tok-shibuya2/800/500",
        ],
      },
      {
        id: "yanaka",
        name: "Yanaka Old Town",
        description:
          "One of Tokyo's last surviving pre-war neighborhoods. Temples, old wooden houses, and the best taiyaki I've ever had.",
        coordinate: { lat: 35.7267, lng: 139.7694 },
        photos: ["https://picsum.photos/seed/tok-yanaka/800/500"],
      },
      {
        id: "senso-ji",
        name: "Senso-ji Temple, Asakusa",
        description:
          "Tokyo's oldest temple is magical before the crowds arrive. Get there at 6 AM for a completely different experience.",
        coordinate: { lat: 35.7147, lng: 139.7967 },
        photos: [
          "https://picsum.photos/seed/tok-asakusa/800/500",
          "https://picsum.photos/seed/tok-asakusa2/800/500",
        ],
      },
    ],
  },
  {
    slug: "kyoto-in-autumn",
    title: "Kyoto in Autumn: Chasing the Red Maple Canopy",
    excerpt:
      "November in Kyoto is something that has no equal. The momiji season turns every temple path into a painting. Here's how I spent 5 days in Japan's most beautiful city.",
    coverImage: "https://picsum.photos/seed/kyoto-autumn/1200/630",
    author: demoAuthor,
    publishedAt: "2025-11-22",
    readingTime: 7,
    tags: ["Japan", "Kyoto", "Autumn", "Temples"],
    countryCode: "JP",
    countryName: "Japan",
    coordinate: { lat: 35.0116, lng: 135.7681, label: "Kyoto, Japan" },
    sections: [
      {
        type: "paragraph",
        content:
          "I've been to Kyoto three times, and every time I tell myself I'll visit in spring for the cherry blossoms. But autumn keeps winning. The fiery reds and oranges draped across thousand-year-old temples are simply unbeatable.",
      },
      { type: "heading", content: "Arashiyama at First Light" },
      {
        type: "paragraph",
        content:
          "The bamboo grove is overrated if you go at noon. Go at 6 AM. You'll have it almost entirely to yourself, the light filters through the stalks in golden columns, and you'll understand why people travel across the planet for this.",
      },
      {
        type: "quote",
        content:
          "Kyoto teaches you that patience and beauty have always been close companions.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/kyoto-maple/800/500",
        alt: "Red maple leaves over temple",
        caption: "Eikan-do Temple during peak momiji",
      },
      {
        src: "https://picsum.photos/seed/kyoto-bamboo/800/500",
        alt: "Bamboo grove",
        caption: "Arashiyama bamboo grove at dawn",
      },
    ],
    places: [
      {
        id: "arashiyama",
        name: "Arashiyama Bamboo Grove",
        description:
          "One of Japan's most iconic landscapes. Arrive before 7 AM to avoid crowds entirely.",
        coordinate: { lat: 35.017, lng: 135.6727 },
        photos: [
          "https://picsum.photos/seed/kyo-bamboo/800/500",
          "https://picsum.photos/seed/kyo-bamboo2/800/500",
        ],
      },
      {
        id: "fushimi-inari",
        name: "Fushimi Inari Shrine",
        description:
          "The endless tunnel of orange torii gates ascending the mountain. Hike all the way to the summit for near-solitude and panoramic views.",
        coordinate: { lat: 34.9671, lng: 135.7727 },
        photos: ["https://picsum.photos/seed/kyo-inari/800/500"],
      },
    ],
  },

  // ─── South Korea (2024) ──────────────────────────────────────────
  {
    slug: "seoul-a-city-that-never-blinks",
    title: "Seoul: A City That Never Blinks",
    excerpt:
      "K-drama landscapes, street food that ruins you for everything else, and a skyline that glows all night. Seoul jumped to the top of my list and refuses to leave.",
    coverImage: "https://picsum.photos/seed/seoul-cover/1200/630",
    author: demoAuthor,
    publishedAt: "2024-09-05",
    readingTime: 9,
    tags: ["South Korea", "Seoul", "Street Food", "K-Culture"],
    countryCode: "KR",
    countryName: "South Korea",
    coordinate: { lat: 37.5665, lng: 126.978, label: "Seoul, South Korea" },
    sections: [
      {
        type: "paragraph",
        content:
          "Seoul is what happens when ancient history and relentless modernity decide to coexist without apology. Palaces sit between glass skyscrapers. Buddhist temples share blocks with 24-hour convenience stores.",
      },
      { type: "heading", content: "Gwangjang Market — Eat Everything" },
      {
        type: "paragraph",
        content:
          "Get here hungry. The bindaetteok (mung bean pancakes), tteokbokki, and mayak kimbap will ruin you. I spent three hours at one stall and zero regrets.",
      },
      {
        type: "list",
        content: "Must-eat in Seoul:",
        items: [
          "Bindaetteok — crispy mung bean pancake",
          "Tteokbokki — spicy rice cakes",
          "Japchae — glass noodles with vegetables",
          "Samgyeopsal — BBQ pork belly",
          "Bingsu — shaved ice dessert",
        ],
      },
      {
        type: "quote",
        content:
          "Seoul doesn't ask if you're ready. It just pulls you into its rhythm and dares you to keep up.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/seoul-palace/800/500",
        alt: "Gyeongbokgung Palace",
        caption: "Gyeongbokgung Palace with Bugaksan in the background",
      },
      {
        src: "https://picsum.photos/seed/seoul-market/800/500",
        alt: "Gwangjang Market",
        caption: "Gwangjang Market's legendary street food stalls",
      },
    ],
    places: [
      {
        id: "gyeongbokgung",
        name: "Gyeongbokgung Palace",
        description:
          "The grandest of Seoul's five royal palaces. Rent a hanbok to enter for free and feel like royalty.",
        coordinate: { lat: 37.5796, lng: 126.977 },
        photos: [
          "https://picsum.photos/seed/seo-palace/800/500",
          "https://picsum.photos/seed/seo-palace2/800/500",
        ],
      },
      {
        id: "bukchon",
        name: "Bukchon Hanok Village",
        description:
          "A hillside village of preserved traditional Korean houses (hanok) with views over the modern city.",
        coordinate: { lat: 37.5826, lng: 126.9831 },
        photos: ["https://picsum.photos/seed/seo-bukchon/800/500"],
      },
      {
        id: "namsan-tower",
        name: "N Seoul Tower",
        description:
          "The city's iconic landmark. Hike up Namsan Mountain or take the cable car for panoramic views at sunset.",
        coordinate: { lat: 37.5512, lng: 126.9882 },
        photos: ["https://picsum.photos/seed/seo-namsan/800/500"],
      },
    ],
  },

  // ─── Italy (2026) ────────────────────────────────────────────────
  {
    slug: "rome-eternal-and-alive",
    title: "Rome: Eternal and Alive",
    excerpt:
      "They call it the Eternal City, and after 10 days there I understand why. Rome isn't a museum — it's a living, breathing place where 2,000-year-old ruins share the street with espresso bars.",
    coverImage: "https://picsum.photos/seed/rome-cover/1200/630",
    author: demoAuthor,
    publishedAt: "2026-03-15",
    readingTime: 10,
    tags: ["Italy", "Rome", "History", "Food"],
    countryCode: "IT",
    countryName: "Italy",
    coordinate: { lat: 41.9028, lng: 12.4964, label: "Rome, Italy" },
    sections: [
      {
        type: "paragraph",
        content:
          "My first morning in Rome: I stepped out of the hotel, turned a corner, and was face-to-face with the Pantheon. No crowd barriers, no ticket booth visible — just the most perfectly preserved ancient building on Earth, casually occupying a piazza where locals were drinking their morning coffee.",
      },
      { type: "heading", content: "Why You MUST Visit the Trastevere" },
      {
        type: "paragraph",
        content:
          "Most tourists stick to the Centro Storico, which is beautiful — but Trastevere is where Rome actually lives. Cobblestone alleys, ivy-covered facades, trattorias with handwritten menus, and a neighborhood energy that feels unchanged for centuries.",
      },
      {
        type: "quote",
        content:
          "In Rome, you don't just see history. You walk through it, eat beside it, and sleep above it.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/rome-colosseum/800/500",
        alt: "Colosseum",
        caption: "The Colosseum at golden hour",
      },
      {
        src: "https://picsum.photos/seed/rome-trevi/800/500",
        alt: "Trevi Fountain",
        caption: "Trevi Fountain before sunrise",
      },
      {
        src: "https://picsum.photos/seed/rome-pasta/800/500",
        alt: "Italian pasta",
        caption: "Cacio e pepe — the Roman masterpiece",
      },
    ],
    places: [
      {
        id: "colosseum",
        name: "The Colosseum",
        description:
          "Book the underground tour early. Walking the same corridors as gladiators is genuinely spine-tingling.",
        coordinate: { lat: 41.8902, lng: 12.4924 },
        photos: [
          "https://picsum.photos/seed/rom-colosseum/800/500",
          "https://picsum.photos/seed/rom-colosseum2/800/500",
        ],
      },
      {
        id: "trastevere",
        name: "Trastevere Neighborhood",
        description:
          "The real soul of Rome. Spend an evening here for dinner and get lost in the alleys afterwards.",
        coordinate: { lat: 41.8895, lng: 12.4697 },
        photos: ["https://picsum.photos/seed/rom-trastevere/800/500"],
      },
      {
        id: "pantheon",
        name: "The Pantheon",
        description:
          "Nearly 2,000 years old and utterly flawless. The oculus — the unglazed hole in the dome — lets rain fall straight in on stormy days. It drains through the marble floor.",
        coordinate: { lat: 41.8986, lng: 12.4769 },
        photos: [
          "https://picsum.photos/seed/rom-pantheon/800/500",
          "https://picsum.photos/seed/rom-pantheon2/800/500",
        ],
      },
    ],
  },
  {
    slug: "amalfi-coast-slow-travel",
    title: "Amalfi Coast: The Case for Going Slow",
    excerpt:
      "Renting a scooter and getting lost on cliffside roads above the Tyrrhenian Sea. Lemon groves, fishing villages, and days with absolutely nowhere to be.",
    coverImage: "https://picsum.photos/seed/amalfi-cover/1200/630",
    author: demoAuthor,
    publishedAt: "2026-07-20",
    readingTime: 6,
    tags: ["Italy", "Amalfi Coast", "Slow Travel", "Coastal"],
    countryCode: "IT",
    countryName: "Italy",
    coordinate: { lat: 40.6339, lng: 14.6027, label: "Amalfi, Italy" },
    sections: [
      {
        type: "paragraph",
        content:
          "Slow travel means something on the Amalfi Coast. The towns are so tightly packed onto vertical cliffs that hurrying anywhere is physically impossible. You climb 300 steps to your hotel, and you stop caring about your schedule.",
      },
      { type: "heading", content: "Positano vs. Ravello — Which to Stay?" },
      {
        type: "paragraph",
        content:
          "Positano is beautiful and expensive and exhausting with tourists. Ravello sits above the crowds with views that make your chest hurt. Stay in Ravello, day-trip to Positano. Thank me later.",
      },
      {
        type: "quote",
        content:
          "There is no bad view on the Amalfi Coast. Every direction is a painting.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/amalfi-coast/800/500",
        alt: "Amalfi coastline",
        caption: "The cliffside road between Positano and Amalfi",
      },
      {
        src: "https://picsum.photos/seed/amalfi-lemon/800/500",
        alt: "Lemon grove",
        caption: "Sfusato Amalfitano — the famous local lemons",
      },
    ],
    places: [
      {
        id: "ravello",
        name: "Ravello",
        description:
          "The quietest and most beautiful village on the coast. Villa Rufolo's gardens overlook the entire sea.",
        coordinate: { lat: 40.6489, lng: 14.6132 },
        photos: [
          "https://picsum.photos/seed/amal-ravello/800/500",
          "https://picsum.photos/seed/amal-ravello2/800/500",
        ],
      },
      {
        id: "positano",
        name: "Positano",
        description:
          "The poster child of the Amalfi Coast. Crowded, yes — but worth every tourist for the view from the water looking back up.",
        coordinate: { lat: 40.6282, lng: 14.4849 },
        photos: ["https://picsum.photos/seed/amal-positano/800/500"],
      },
    ],
  },

  // ─── USA (2024) ──────────────────────────────────────────────────
  {
    slug: "national-parks-road-trip",
    title: "3 Weeks, 5 National Parks: The Great American Road Trip",
    excerpt:
      "Zion, Bryce Canyon, Capitol Reef, Canyonlands, and Arches. I drove 2,800 miles through the American Southwest and came back a different person.",
    coverImage: "https://picsum.photos/seed/utah-parks/1200/630",
    author: demoAuthor,
    publishedAt: "2024-06-18",
    readingTime: 12,
    tags: ["USA", "National Parks", "Road Trip", "Nature"],
    countryCode: "US",
    countryName: "United States",
    coordinate: { lat: 37.2982, lng: -113.0263, label: "Zion, Utah, USA" },
    sections: [
      {
        type: "paragraph",
        content:
          "I have a confession: I've traveled to 40+ countries but had never done a proper American road trip. The Southwest fixed that permanently. The scale of the landscape is something photos cannot prepare you for.",
      },
      { type: "heading", content: "Zion Canyon — Breathtaking in Every Sense" },
      {
        type: "paragraph",
        content:
          "Angel's Landing is the famous hike, but the Narrows is the memory that stays forever. Wading through a canyon carved by the Virgin River, walls rising 1,000 feet on either side — I've never felt smaller, or more grateful to be alive.",
      },
      {
        type: "list",
        content: "Ranked by awe (all incredible):",
        items: [
          "1. Bryce Canyon — alien hoodoos at sunrise",
          "2. Canyonlands — the quietest park, the most epic views",
          "3. Zion — the most dramatic hiking",
          "4. Arches — Delicate Arch at sunset is obligatory",
          "5. Capitol Reef — least crowded, most underrated",
        ],
      },
      {
        type: "quote",
        content:
          "The American Southwest doesn't just give you views. It gives you perspective.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/zion-canyon/800/500",
        alt: "Zion Canyon",
        caption: "Zion Canyon from Angels Landing trail",
      },
      {
        src: "https://picsum.photos/seed/bryce-canyon/800/500",
        alt: "Bryce Canyon",
        caption: "Bryce Canyon hoodoos at dawn",
      },
      {
        src: "https://picsum.photos/seed/arches-park/800/500",
        alt: "Delicate Arch",
        caption: "Delicate Arch, Arches National Park",
      },
    ],
    places: [
      {
        id: "zion-narrows",
        name: "The Narrows, Zion",
        description:
          "Hike through a river gorge with walls that dwarf everything. Rent the waterproof boots — don't try it in regular shoes.",
        coordinate: { lat: 37.3027, lng: -112.9474 },
        photos: [
          "https://picsum.photos/seed/zion-narrows/800/500",
          "https://picsum.photos/seed/zion-narrows2/800/500",
        ],
      },
      {
        id: "bryce-sunrise",
        name: "Bryce Canyon Amphitheater",
        description:
          "Watch sunrise from Bryce Point. The hoodoos glow orange and pink before the blue sky kicks in — the best 45 minutes in the American Southwest.",
        coordinate: { lat: 37.5985, lng: -112.1714 },
        photos: ["https://picsum.photos/seed/bryce-sunrise/800/500"],
      },
      {
        id: "delicate-arch",
        name: "Delicate Arch, Arches NP",
        description:
          "The hike up is hot and exposed, but nothing prepares you for cresting that final ridge and seeing the arch appear against a blue sky.",
        coordinate: { lat: 38.7436, lng: -109.4993 },
        photos: [
          "https://picsum.photos/seed/del-arch/800/500",
          "https://picsum.photos/seed/del-arch2/800/500",
        ],
      },
    ],
  },

  // ─── France (2025) ───────────────────────────────────────────────
  {
    slug: "paris-beyond-the-eiffel-tower",
    title: "Paris Beyond the Eiffel Tower: A Week in the Real City",
    excerpt:
      "I deliberately avoided the major landmarks for the first three days. What I found instead was the Paris locals actually love — and it was so much better.",
    coverImage: "https://picsum.photos/seed/paris-cover/1200/630",
    author: demoAuthor,
    publishedAt: "2025-09-28",
    readingTime: 7,
    tags: ["France", "Paris", "Local Life", "Food"],
    countryCode: "FR",
    countryName: "France",
    coordinate: { lat: 48.8566, lng: 2.3522, label: "Paris, France" },
    sections: [
      {
        type: "paragraph",
        content:
          "Everyone arrives in Paris with a list: Eiffel Tower, Louvre, Sacré-Cœur. These are beautiful. But if you stay only there, you miss the Paris that makes people move here, fall in love here, write about it for centuries.",
      },
      { type: "heading", content: "The Marais — The Neighborhood I'd Live In" },
      {
        type: "paragraph",
        content:
          "Le Marais is home to the best falafel I've ever eaten (L'As du Fallafel — the line is worth it), beautiful medieval architecture, world-class galleries, and the most fashionable people-watching in Europe.",
      },
      {
        type: "quote",
        content:
          "Paris is not a destination. It's a state of mind that happens to have the best bread.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/paris-marais/800/500",
        alt: "Le Marais",
        caption: "Golden afternoon light in Le Marais",
      },
      {
        src: "https://picsum.photos/seed/paris-boulangerie/800/500",
        alt: "French boulangerie",
        caption: "The best croissant I've ever had — place d'Aligre",
      },
      {
        src: "https://picsum.photos/seed/paris-montmartre/800/500",
        alt: "Montmartre street",
        caption: "Steep alleys of Montmartre at dusk",
      },
    ],
    places: [
      {
        id: "le-marais",
        name: "Le Marais",
        description:
          "The most interesting neighborhood in Paris. Medieval streets, contemporary art galleries, excellent food, and the best coffee in the city.",
        coordinate: { lat: 48.8576, lng: 2.3614 },
        photos: [
          "https://picsum.photos/seed/par-marais/800/500",
          "https://picsum.photos/seed/par-marais2/800/500",
        ],
      },
      {
        id: "montmartre",
        name: "Montmartre",
        description:
          "Skip Sacré-Cœur (briefly visit it) and spend the rest of your time in the streets below. Place du Tertre, the vineyard, and the windmills are the real story.",
        coordinate: { lat: 48.8867, lng: 2.3431 },
        photos: ["https://picsum.photos/seed/par-montmartre/800/500"],
      },
      {
        id: "canal-saint-martin",
        name: "Canal Saint-Martin",
        description:
          "A canal lined with iron footbridges and young Parisians having picnics on the banks. On Sundays it's closed to cars and becomes a giant promenade.",
        coordinate: { lat: 48.8693, lng: 2.3637 },
        photos: [
          "https://picsum.photos/seed/par-canal/800/500",
          "https://picsum.photos/seed/par-canal2/800/500",
        ],
      },
    ],
  },
  {
    slug: "provence-lavender-and-light",
    title: "Provence: Lavender Fields and the Golden Light of the South",
    excerpt:
      "Renting a farmhouse in the Luberon for two weeks in July. Lavender season, outdoor markets, rosé at noon, and a pace of life that resets something in you.",
    coverImage: "https://picsum.photos/seed/provence-cover/1200/630",
    author: demoAuthor,
    publishedAt: "2025-07-10",
    readingTime: 8,
    tags: ["France", "Provence", "Countryside", "Summer"],
    countryCode: "FR",
    countryName: "France",
    coordinate: {
      lat: 43.9493,
      lng: 5.1044,
      label: "Luberon, Provence, France",
    },
    sections: [
      {
        type: "paragraph",
        content:
          "The lavender fields of Provence are in bloom for roughly three weeks in July, and for those three weeks, the entire landscape turns violet and the air smells like a dream you once had.",
      },
      { type: "heading", content: "Sénanque Abbey in Morning Fog" },
      {
        type: "paragraph",
        content:
          "The famous photo of Sénanque Abbey surrounded by lavender — I've seen it a thousand times online. Nothing prepared me for the real thing: the fog rolling in at 6 AM, the monks' bells echoing, the rows of purple stretching to the old stone walls.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/prov-lavender/800/500",
        alt: "Lavender fields",
        caption: "Lavender fields near Valensole plateau",
      },
      {
        src: "https://picsum.photos/seed/prov-abbey/800/500",
        alt: "Sénanque Abbey",
        caption: "Sénanque Abbey in morning mist",
      },
    ],
    places: [
      {
        id: "senanque-abbey",
        name: "Sénanque Abbey",
        description:
          "A 12th-century Cistercian abbey surrounded by lavender fields. Arrive at dawn for the best light and smallest crowds.",
        coordinate: { lat: 43.9219, lng: 5.1898 },
        photos: [
          "https://picsum.photos/seed/prov-senanque/800/500",
          "https://picsum.photos/seed/prov-senanque2/800/500",
        ],
      },
      {
        id: "les-baux",
        name: "Les Baux-de-Provence",
        description:
          "A medieval village perched on a limestone massif above the Alpilles. Best visited at sunset when the stone glows orange.",
        coordinate: { lat: 43.7442, lng: 4.7954 },
        photos: ["https://picsum.photos/seed/prov-baux/800/500"],
      },
    ],
  },
  {
    slug: "french-riviera-off-season",
    title: "The French Riviera Off-Season: A Different Kind of Beautiful",
    excerpt:
      "Everyone visits Côte d'Azur in August. I went in November and had the beaches to myself, the restaurants without queues, and the light that impressionists painted for.",
    coverImage: "https://picsum.photos/seed/riviera-cover/1200/630",
    author: demoAuthor,
    publishedAt: "2025-11-05",
    readingTime: 6,
    tags: ["France", "Riviera", "Off-Season", "Mediterranean"],
    countryCode: "FR",
    countryName: "France",
    coordinate: { lat: 43.7102, lng: 7.262, label: "Nice, France" },
    sections: [
      {
        type: "paragraph",
        content:
          "November on the French Riviera is the dirty secret that locals don't advertise. The tourist hordes are gone. The hotels drop their prices by half. The light that Matisse, Renoir and Picasso moved here to paint is at its most magical.",
      },
      { type: "heading", content: "Nice's Old Town — Uninterrupted" },
      {
        type: "paragraph",
        content:
          "In summer, Vieux-Nice is shoulder to shoulder. In November, you can photograph the ochre and yellow facades without a crowd in frame. The morning market on Cours Saleya is twice as good when you can actually move through it.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/nice-old-town/800/500",
        alt: "Nice Old Town",
        caption: "Vieux-Nice morning market in November",
      },
      {
        src: "https://picsum.photos/seed/eze-village/800/500",
        alt: "Eze village",
        caption: "Eze perched above the Mediterranean",
      },
    ],
    places: [
      {
        id: "vieux-nice",
        name: "Vieux-Nice (Old Town)",
        description:
          "Baroque churches, Baroque facades, and the best socca (chickpea pancake) you'll ever eat from a street vendor.",
        coordinate: { lat: 43.6961, lng: 7.2762 },
        photos: [
          "https://picsum.photos/seed/nice-old/800/500",
          "https://picsum.photos/seed/nice-old2/800/500",
        ],
      },
      {
        id: "eze",
        name: "Eze Village",
        description:
          "A medieval village on a cliff 430m above the sea. The view from the cactus garden at the top is one of the finest on the Mediterranean.",
        coordinate: { lat: 43.7288, lng: 7.3617 },
        photos: ["https://picsum.photos/seed/eze-village/800/500"],
      },
    ],
  },
];

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return mockBlogs.find((b) => b.slug === slug);
}

export function getBlogsByAuthor(username: string): BlogPost[] {
  return mockBlogs.filter((b) => b.author.username === username);
}

export function getBlogsByCountry(countryCode: string): BlogPost[] {
  return mockBlogs.filter((b) => b.countryCode === countryCode);
}

/** Get unique countries from all blog posts */
export function getCountrySummaries(): CountrySummary[] {
  const map = new Map<string, CountrySummary>();
  for (const blog of mockBlogs) {
    const existing = map.get(blog.countryCode);
    const year = new Date(blog.publishedAt).getFullYear();
    if (existing) {
      if (!existing.years.includes(year)) existing.years.push(year);
      // keep the newest blog as cover
      if (blog.publishedAt > existing.latestDate) {
        existing.latestDate = blog.publishedAt;
        existing.coverImage = blog.coverImage;
      }
    } else {
      map.set(blog.countryCode, {
        countryCode: blog.countryCode,
        countryName: blog.countryName,
        coverImage: blog.coverImage,
        years: [year],
        latestDate: blog.publishedAt,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    b.latestDate.localeCompare(a.latestDate),
  );
}

export interface CountrySummary {
  countryCode: string;
  countryName: string;
  coverImage: string;
  years: number[];
  latestDate: string;
}
