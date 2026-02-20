// Mock blog dataset – edit this file to change demo content

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
  name: "Alex Rivera",
  avatar: "https://picsum.photos/seed/alex/200/200",
  bio: "Full-stack developer & tech writer. I write about web development, design systems, and the future of the internet. Building in public at BlogGo.",
  followers: 2847,
  posts: 5,
};

export const mockBlogs: BlogPost[] = [
  {
    slug: "getting-started-with-nextjs-14",
    title: "Getting Started with Next.js 14: The Complete Guide",
    excerpt:
      "Everything you need to know to build production-ready apps with Next.js 14's App Router, Server Components, and the new data fetching patterns.",
    coverImage: "https://picsum.photos/seed/nextjs/1200/630",
    author: demoAuthor,
    publishedAt: "2026-02-10",
    readingTime: 8,
    tags: ["Next.js", "React", "TypeScript", "Web Dev"],
    coordinate: {
      lat: 37.7749,
      lng: -122.4194,
      label: "San Francisco, CA",
    },
    sections: [
      {
        type: "paragraph",
        content:
          "Next.js 14 represents a major leap forward in the React ecosystem. With the stable release of the App Router and React Server Components, building performant web applications has never been more intuitive.",
      },
      {
        type: "heading",
        content: "Why Next.js 14?",
      },
      {
        type: "paragraph",
        content:
          "The App Router brings a new mental model for building React applications. Instead of thinking in terms of pages and API routes, you think in terms of layouts, templates, and server-side data fetching co-located with your components.",
      },
      {
        type: "list",
        content: "Key features in Next.js 14:",
        items: [
          "React Server Components by default",
          "Partial Prerendering (experimental)",
          "Server Actions for form handling",
          "Improved Turbopack performance",
          "Streaming and Suspense support",
        ],
      },
      {
        type: "heading",
        content: "Setting Up Your Project",
      },
      {
        type: "code",
        content:
          "npx create-next-app@latest my-app --typescript --tailwind --app",
        language: "bash",
      },
      {
        type: "paragraph",
        content:
          "This command scaffolds a fully configured Next.js project with TypeScript, Tailwind CSS, and the App Router. You're ready to build in minutes.",
      },
      {
        type: "quote",
        content:
          "The best framework is the one that gets out of your way and lets you focus on building great products.",
      },
      {
        type: "heading",
        content: "Understanding the App Router",
      },
      {
        type: "paragraph",
        content:
          "The App Router uses a file-system based routing where folders define routes and special files like page.tsx, layout.tsx, loading.tsx, and error.tsx define the UI for each segment. This co-location of concerns makes large codebases much easier to navigate.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/next1/800/500",
        alt: "Next.js App Router diagram",
        caption: "The App Router file structure",
      },
      {
        src: "https://picsum.photos/seed/next2/800/500",
        alt: "Server Components diagram",
        caption: "Server vs Client Components",
      },
      {
        src: "https://picsum.photos/seed/next3/800/500",
        alt: "Data fetching patterns",
        caption: "Modern data fetching with async/await",
      },
    ],
    places: [
      {
        id: "sf-ferry-building",
        name: "Ferry Building Marketplace",
        description:
          "Started the morning at the iconic Ferry Building along the Embarcadero. Grabbed an artisan coffee and walked through the local vendor stalls — the perfect spot to kick off a day of coding and exploring.",
        coordinate: { lat: 37.7955, lng: -122.3937 },
        photos: [
          "https://picsum.photos/seed/sf-ferry/800/500",
          "https://picsum.photos/seed/sf-ferry2/800/500",
        ],
      },
      {
        id: "sf-salesforce-park",
        name: "Salesforce Transit Center Rooftop Park",
        description:
          "Took a break at the rooftop park above the Salesforce Transit Center. The elevated green space in the middle of downtown is an incredible place to sit with a laptop and prototype new ideas.",
        coordinate: { lat: 37.7897, lng: -122.3972 },
        photos: ["https://picsum.photos/seed/sf-salesforce/800/500"],
      },
      {
        id: "sf-golden-gate",
        name: "Golden Gate Viewpoint",
        description:
          "No trip to San Francisco is complete without seeing the Golden Gate Bridge. Watched the fog roll in from Battery Spencer — the kind of moment that reminds you why the Bay Area inspires so many builders.",
        coordinate: { lat: 37.8324, lng: -122.4795 },
        photos: [
          "https://picsum.photos/seed/sf-gg/800/500",
          "https://picsum.photos/seed/sf-gg2/800/500",
        ],
      },
      {
        id: "sf-dolores-park",
        name: "Mission Dolores Park",
        description:
          "Afternoon wind-down at Dolores Park with stunning city views. The vibrant energy of the Mission neighborhood is infectious — street art, taquerias, and sunshine.",
        coordinate: { lat: 37.7596, lng: -122.4269 },
        photos: ["https://picsum.photos/seed/sf-dolores/800/500"],
      },
    ],
  },
  {
    slug: "design-systems-that-scale",
    title: "Building Design Systems That Actually Scale",
    excerpt:
      "A practical guide to creating component libraries that grow with your team — from design tokens to documentation to versioning.",
    coverImage: "https://picsum.photos/seed/design/1200/630",
    author: demoAuthor,
    publishedAt: "2026-02-03",
    readingTime: 6,
    tags: ["Design Systems", "CSS", "UI/UX", "Components"],
    coordinate: {
      lat: 40.7128,
      lng: -74.006,
      label: "New York, NY",
    },
    sections: [
      {
        type: "paragraph",
        content:
          "A design system is more than a component library — it's a shared language between designers and developers. Done right, it accelerates product development and ensures consistency across every surface.",
      },
      {
        type: "heading",
        content: "Start with Design Tokens",
      },
      {
        type: "paragraph",
        content:
          "Design tokens are the atomic values of your design system: colors, spacing, typography, shadows. By defining these as variables, you create a single source of truth that both your design tools and code can reference.",
      },
      {
        type: "heading",
        content: "Component API Design",
      },
      {
        type: "paragraph",
        content:
          "Great components have predictable, minimal APIs. Prefer composition over configuration. A Button shouldn't have 20 props — it should have variants, sizes, and children. Everything else should be composable.",
      },
      {
        type: "quote",
        content:
          "The best component API is one that feels obvious in hindsight.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/ds1/800/500",
        alt: "Design tokens visualization",
        caption: "Design tokens as the foundation",
      },
      {
        src: "https://picsum.photos/seed/ds2/800/500",
        alt: "Component library",
        caption: "A well-organized component library",
      },
    ],
    places: [
      {
        id: "ny-highline",
        name: "The High Line",
        description:
          "Walked the elevated park built on a historic rail line through Chelsea. The integration of architecture, nature, and public art along the High Line is a masterclass in design systems thinking — consistent patterns, flexible expression.",
        coordinate: { lat: 40.748, lng: -74.0048 },
        photos: [
          "https://picsum.photos/seed/ny-highline/800/500",
          "https://picsum.photos/seed/ny-highline2/800/500",
        ],
      },
      {
        id: "ny-chelsea-market",
        name: "Chelsea Market",
        description:
          "Stopped at Chelsea Market to refuel. The converted factory space is a great example of adaptive reuse — just like good design tokens, the bones stay the same while the surface expression evolves.",
        coordinate: { lat: 40.7425, lng: -74.0061 },
        photos: ["https://picsum.photos/seed/ny-chelsea/800/500"],
      },
      {
        id: "ny-brooklyn-bridge",
        name: "Brooklyn Bridge",
        description:
          "Crossed the Brooklyn Bridge at sunset. The engineering marvel from 1883 still stands — proof that building for durability matters, whether it's infrastructure or component libraries.",
        coordinate: { lat: 40.7061, lng: -73.9969 },
        photos: [
          "https://picsum.photos/seed/ny-bridge/800/500",
          "https://picsum.photos/seed/ny-bridge2/800/500",
        ],
      },
      {
        id: "ny-dumbo",
        name: "DUMBO Waterfront",
        description:
          "Ended the day at the DUMBO waterfront with views of the Manhattan skyline. The neighborhood's blend of old warehouses and tech startups captures the spirit of building modern systems on proven foundations.",
        coordinate: { lat: 40.7033, lng: -73.9894 },
        photos: ["https://picsum.photos/seed/ny-dumbo/800/500"],
      },
    ],
  },
  {
    slug: "typescript-tips-for-react-devs",
    title: "10 TypeScript Tips Every React Developer Should Know",
    excerpt:
      "Level up your TypeScript skills with these practical patterns for typing React components, hooks, and async data.",
    coverImage: "https://picsum.photos/seed/typescript/1200/630",
    author: demoAuthor,
    publishedAt: "2026-01-27",
    readingTime: 7,
    tags: ["TypeScript", "React", "Tips", "Developer Tools"],
    coordinate: {
      lat: 51.5074,
      lng: -0.1278,
      label: "London, UK",
    },
    sections: [
      {
        type: "paragraph",
        content:
          "TypeScript has become the de facto standard for large React applications. But many developers only scratch the surface of what TypeScript can do. Here are 10 patterns that will make your code safer and more expressive.",
      },
      {
        type: "heading",
        content: "1. Use Discriminated Unions for State",
      },
      {
        type: "paragraph",
        content:
          "Instead of using boolean flags like isLoading, isError, isSuccess, model your async state as a discriminated union. This makes impossible states impossible.",
      },
      {
        type: "code",
        content: `type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }`,
        language: "typescript",
      },
      {
        type: "heading",
        content: "2. Infer Types from Data",
      },
      {
        type: "paragraph",
        content:
          "Use typeof and ReturnType to infer types from your data and functions rather than duplicating type definitions. This keeps your types in sync automatically.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/ts1/800/500",
        alt: "TypeScript code",
        caption: "Type-safe React components",
      },
    ],
    places: [
      {
        id: "lon-british-museum",
        name: "British Museum",
        description:
          "Explored the British Museum's vast halls. The way the museum organizes millions of artifacts into navigable galleries mirrors the challenge of typing a large codebase — structure brings clarity.",
        coordinate: { lat: 51.5194, lng: -0.127 },
        photos: [
          "https://picsum.photos/seed/lon-museum/800/500",
          "https://picsum.photos/seed/lon-museum2/800/500",
        ],
      },
      {
        id: "lon-south-bank",
        name: "South Bank & Tate Modern",
        description:
          "Strolled along the South Bank past the Tate Modern. London's cultural corridor along the Thames is the perfect backdrop for thinking about how types shape creative expression in code.",
        coordinate: { lat: 51.5076, lng: -0.0994 },
        photos: ["https://picsum.photos/seed/lon-tate/800/500"],
      },
      {
        id: "lon-shoreditch",
        name: "Shoreditch Tech Hub",
        description:
          "Visited the Shoreditch tech scene — co-working spaces, street art, and indie coffee shops. The neighborhood buzzes with the same energy you feel when a perfectly typed API clicks into place.",
        coordinate: { lat: 51.5235, lng: -0.0773 },
        photos: [
          "https://picsum.photos/seed/lon-shoreditch/800/500",
          "https://picsum.photos/seed/lon-shoreditch2/800/500",
        ],
      },
    ],
  },
  {
    slug: "the-art-of-readable-code",
    title: "The Art of Readable Code: Writing for Humans",
    excerpt:
      "Code is read far more often than it's written. Here's how to write code that your future self and teammates will actually understand.",
    coverImage: "https://picsum.photos/seed/readable/1200/630",
    author: demoAuthor,
    publishedAt: "2026-01-15",
    readingTime: 5,
    tags: ["Best Practices", "Clean Code", "Engineering"],
    coordinate: {
      lat: 35.6762,
      lng: 139.6503,
      label: "Tokyo, Japan",
    },
    sections: [
      {
        type: "paragraph",
        content:
          "The best code is code that doesn't need comments because it's so clear. But getting there requires intentional practice and a shift in mindset — from writing code for computers to writing code for humans.",
      },
      {
        type: "heading",
        content: "Name Things Honestly",
      },
      {
        type: "paragraph",
        content:
          "Variable and function names should tell you what they do, not how they do it. getUserById is better than fetchData. isEmailValid is better than check.",
      },
      {
        type: "quote",
        content:
          "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/code1/800/500",
        alt: "Clean code example",
        caption: "Readable code in practice",
      },
      {
        src: "https://picsum.photos/seed/code2/800/500",
        alt: "Code review",
        caption: "Code reviews improve readability",
      },
    ],
    places: [
      {
        id: "tok-shibuya",
        name: "Shibuya Crossing",
        description:
          "Stood at the world's busiest pedestrian crossing. Shibuya's organized chaos is like a well-written codebase — thousands of moving pieces, yet everyone knows exactly where to go.",
        coordinate: { lat: 35.6595, lng: 139.7004 },
        photos: [
          "https://picsum.photos/seed/tok-shibuya/800/500",
          "https://picsum.photos/seed/tok-shibuya2/800/500",
        ],
      },
      {
        id: "tok-meiji-shrine",
        name: "Meiji Shrine",
        description:
          "Found peace in the forested grounds of Meiji Shrine. The deliberate simplicity of the shrine's design philosophy aligns perfectly with writing readable code — remove everything that isn't essential.",
        coordinate: { lat: 35.6764, lng: 139.6993 },
        photos: ["https://picsum.photos/seed/tok-meiji/800/500"],
      },
      {
        id: "tok-akihabara",
        name: "Akihabara Electric Town",
        description:
          "Dove into Akihabara's multi-story electronics shops and retro game arcades. The district is a reminder that technology should spark joy — and so should the code we write.",
        coordinate: { lat: 35.6984, lng: 139.7731 },
        photos: [
          "https://picsum.photos/seed/tok-akiba/800/500",
          "https://picsum.photos/seed/tok-akiba2/800/500",
        ],
      },
      {
        id: "tok-teamlab",
        name: "teamLab Borderless",
        description:
          "Immersed in the digital art world of teamLab Borderless. The way their installations flow seamlessly between rooms is the ultimate metaphor for readable, flowing code.",
        coordinate: { lat: 35.6256, lng: 139.7838 },
        photos: ["https://picsum.photos/seed/tok-teamlab/800/500"],
      },
    ],
  },
  {
    slug: "web-performance-in-2026",
    title: "Web Performance in 2026: What Actually Matters",
    excerpt:
      "Core Web Vitals, INP, TTFB — cutting through the noise to focus on the performance metrics that actually impact user experience.",
    coverImage: "https://picsum.photos/seed/perf/1200/630",
    author: demoAuthor,
    publishedAt: "2026-01-08",
    readingTime: 9,
    tags: ["Performance", "Web Vitals", "Optimization", "UX"],
    coordinate: {
      lat: 37.5665,
      lng: 126.978,
      label: "Seoul, South Korea",
    },
    sections: [
      {
        type: "paragraph",
        content:
          "Performance is a feature. Studies consistently show that faster websites have higher conversion rates, lower bounce rates, and better user satisfaction. But with so many metrics to track, where do you focus?",
      },
      {
        type: "heading",
        content: "The Core Web Vitals That Matter",
      },
      {
        type: "list",
        content: "Focus on these three metrics:",
        items: [
          "LCP (Largest Contentful Paint) — loading performance",
          "INP (Interaction to Next Paint) — responsiveness",
          "CLS (Cumulative Layout Shift) — visual stability",
        ],
      },
      {
        type: "heading",
        content: "Quick Wins",
      },
      {
        type: "paragraph",
        content:
          "Before reaching for complex optimizations, make sure you've covered the basics: optimize images with next/image, use font-display: swap, defer non-critical scripts, and leverage CDN caching.",
      },
    ],
    gallery: [
      {
        src: "https://picsum.photos/seed/perf1/800/500",
        alt: "Performance metrics dashboard",
        caption: "Core Web Vitals in Lighthouse",
      },
      {
        src: "https://picsum.photos/seed/perf2/800/500",
        alt: "Waterfall chart",
        caption: "Network waterfall analysis",
      },
      {
        src: "https://picsum.photos/seed/perf3/800/500",
        alt: "Performance improvement graph",
        caption: "Before and after optimization",
      },
    ],
    places: [
      {
        id: "seo-gangnam",
        name: "Gangnam Station Area",
        description:
          "Started in the heart of Gangnam's tech corridor. South Korea's internet speeds are legendary — testing web performance here sets the highest bar for what users expect.",
        coordinate: { lat: 37.498, lng: 127.0276 },
        photos: [
          "https://picsum.photos/seed/seo-gangnam/800/500",
          "https://picsum.photos/seed/seo-gangnam2/800/500",
        ],
      },
      {
        id: "seo-bukchon",
        name: "Bukchon Hanok Village",
        description:
          "Wandered through the traditional hanok houses nestled between modern towers. The contrast between old and new is a reminder that performance optimization is about respecting constraints while pushing boundaries.",
        coordinate: { lat: 37.5826, lng: 126.9831 },
        photos: ["https://picsum.photos/seed/seo-bukchon/800/500"],
      },
      {
        id: "seo-hongdae",
        name: "Hongdae Street",
        description:
          "Explored Hongdae's vibrant street culture — live music, indie shops, and bustling cafes. The energy here is a perfect match for the fast-paced world of web performance where every millisecond counts.",
        coordinate: { lat: 37.5563, lng: 126.9236 },
        photos: [
          "https://picsum.photos/seed/seo-hongdae/800/500",
          "https://picsum.photos/seed/seo-hongdae2/800/500",
        ],
      },
      {
        id: "seo-namsan",
        name: "N Seoul Tower",
        description:
          "Hiked up Namsan Mountain to N Seoul Tower for panoramic city views. From the top, the sprawling metropolis below is a visual metaphor for the scale at which performance truly matters.",
        coordinate: { lat: 37.5512, lng: 126.9882 },
        photos: ["https://picsum.photos/seed/seo-namsan/800/500"],
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
