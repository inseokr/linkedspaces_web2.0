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
  },
];

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return mockBlogs.find((b) => b.slug === slug);
}

export function getBlogsByAuthor(username: string): BlogPost[] {
  return mockBlogs.filter((b) => b.author.username === username);
}
