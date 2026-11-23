export interface Guide {
  slug: string;
  keyword: string;
  title: string;
  metaDescription: string;
  intro: string[];
  steps: { title: string; body: string }[];
  faqs: { question: string; answer: string }[];
  screenshot: { src: string; alt: string };
  related: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: "turn-photos-into-travel-blog",
    keyword: "how to turn photos into a travel blog",
    title: "How to turn photos into a travel blog",
    metaDescription:
      "Turn your trip photos into a travel blog automatically. Bloggo groups your camera roll by day and place and writes a structured draft in seconds.",
    intro: [
      "The fastest way to turn photos into a travel blog is to let the photos do the structuring. Your camera roll already knows when and where every shot happened — the right app turns that metadata into days, places, and a story outline without any manual sorting.",
      "Bloggo does exactly this on your iPhone. It finds trips in your camera roll, groups photos by place, and hands you a structured blog draft — cover, days, places, and captions — ready for your voice. Your photos never leave your device.",
    ],
    steps: [
      {
        title: "Open Bloggo and tap 'Tap to Blog'",
        body: "Bloggo scans your camera roll on-device and lists every trip it finds, grouped by year. A weekend away or a three-week tour — each shows up with its dates, location, and photo count.",
      },
      {
        title: "Pick the trip you want to tell",
        body: "Select one trip, or merge several memories into a single blog. Tap 'Create Blog' and Bloggo builds the draft.",
      },
      {
        title: "Review the draft",
        body: "You get a cover with your trip title and map, a page per day, and place cards with your photos already in order. Nothing to arrange.",
      },
      {
        title: "Add your voice",
        body: "Describe each day in a sentence, tap a photo to tell its story, and save. The structure is done; the words are yours.",
      },
    ],
    faqs: [
      {
        question: "Do I have to sort my photos first?",
        answer:
          "No. Bloggo reads the time and location data your iPhone already stores and does the sorting for you.",
      },
      {
        question: "Does Bloggo upload my photos to create the blog?",
        answer:
          "No. Trip detection and blog creation happen on your device. Photos are only shared if you export or publish a blog yourself.",
      },
      {
        question: "Can I edit the blog after it's created?",
        answer:
          "Yes. Every title, caption, and photo is editable. The draft is a starting point, not a final cut.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/turn-photos-into-travel-blog.png",
      alt: "A finished Bloggo travel blog cover for a winter trip, with trip dates, moment count, and a route map",
    },
    related: [
      "organize-travel-photos-by-trip",
      "instagram-carousel-from-travel-photos",
      "turn-camera-roll-into-diary",
    ],
  },
  {
    slug: "organize-travel-photos-by-trip",
    keyword: "organize travel photos by trip automatically",
    title: "How to organize travel photos by trip, automatically",
    metaDescription:
      "Stop sorting albums by hand. Bloggo detects trips in your camera roll using time and location and organizes travel photos by trip and place.",
    intro: [
      "Organizing travel photos by hand means scrolling through thousands of shots and dragging them into albums — most people give up halfway. Automatic organization uses the timestamps and GPS data already attached to your photos, so the sorting is done before you start.",
      "Bloggo scans your camera roll on your iPhone, detects when you were traveling, and groups every trip's photos by day and place. No albums, no tagging, no uploads.",
    ],
    steps: [
      {
        title: "Let Bloggo scan your camera roll",
        body: "Open Bloggo and grant photo access. The scan runs on-device and finds trips using time and location patterns.",
      },
      {
        title: "Browse your trips by year",
        body: "The 'Your Memories' screen lists every detected trip with its dates, city, and photo count — three trips or 35, all found for you.",
      },
      {
        title: "Open a trip to see it grouped by place",
        body: "Inside each trip, photos are clustered by the places you visited, in the order you visited them, with the distances in between.",
      },
      {
        title: "Rescan whenever you like",
        body: "New photos, new trips. Tap 'Rescan memories' after your next trip and it appears in the list.",
      },
    ],
    faqs: [
      {
        question: "What if a trip is split in two?",
        answer:
          "Select both memories and merge them into one blog — a split trip is a two-tap fix.",
      },
      {
        question: "Does this work on old trips?",
        answer:
          "Yes. Bloggo scans your whole camera roll, so trips from years ago show up alongside last weekend.",
      },
      {
        question: "Is my location data shared?",
        answer:
          "No. Bloggo reads photo metadata on your device to group trips. Nothing is uploaded.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/automatic-trip-detection.png",
      alt: "Bloggo's Your Memories screen with trips detected automatically from the camera roll, grouped by year",
    },
    related: [
      "turn-photos-into-travel-blog",
      "travel-map-of-places-visited",
      "turn-camera-roll-into-diary",
    ],
  },
  {
    slug: "instagram-carousel-from-travel-photos",
    keyword: "make an Instagram carousel from travel photos",
    title: "How to make an Instagram carousel from travel photos",
    metaDescription:
      "Turn trip photos into Instagram-ready carousel slides — covers, maps, and place highlights in 4:5 or 9:16 — straight from your camera roll with Bloggo.",
    intro: [
      "A good travel carousel needs more than ten photos in a row: a cover slide, a sense of place, and a consistent look. Building that in a photo editor takes an evening per trip.",
      "Bloggo exports your trip as ready-made carousel slides — cover pages, maps, and place highlights included — in Instagram's 4:5 or 9:16 formats. You pick the trip; it builds the slides.",
    ],
    steps: [
      {
        title: "Create your trip blog",
        body: "Tap 'Tap to Blog', pick the trip, and Bloggo drafts it with days, places, and captions.",
      },
      {
        title: "Open 'Share Your Blog'",
        body: "From the blog cover, tap 'Share Your Blog' and choose 'Post to Social Media'.",
      },
      {
        title: "Pick your format",
        body: "Choose 4:5 for feed carousels or 9:16 for stories and vertical formats. Slides include your cover, route map, and place highlights.",
      },
      {
        title: "Download or share directly",
        body: "Save the slides to your camera roll, or share them straight into Instagram, TikTok, or any other app.",
      },
    ],
    faqs: [
      {
        question: "Which aspect ratios are supported?",
        answer: "4:5 for feed posts and 9:16 for stories and vertical formats.",
      },
      {
        question: "Can I choose which places make the cut?",
        answer:
          "Yes. The slides follow your blog, so edit the blog first and the export matches it.",
      },
      {
        question: "Do I need an account to export?",
        answer:
          "You can try Bloggo as a guest and export once; a free account removes the guest caps.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/share-carousel-pdf-video.png",
      alt: "Bloggo's share sheet with options to post to social media, stitch reels, and export as PDF",
    },
    related: [
      "travel-video-slideshow-with-music",
      "travel-photo-book-from-iphone",
      "turn-photos-into-travel-blog",
    ],
  },
  {
    slug: "travel-photo-book-from-iphone",
    keyword: "create a travel photo book / PDF on iPhone",
    title: "How to create a travel photo book on your iPhone",
    metaDescription:
      "Make a printable travel photo book from your iPhone in one tap. Bloggo turns your trip into a PDF storybook with days, places, maps, and captions.",
    intro: [
      "You don't need desktop software or a photo-book service to get a printable record of a trip. If your photos are organized by day and place, a PDF storybook is one tap away.",
      "Bloggo drafts your trip as a structured blog, then exports it as a PDF storybook — cover, days, places, maps, and your captions — ready for reading, printing, or sending to family.",
    ],
    steps: [
      {
        title: "Turn the trip into a blog",
        body: "Tap 'Tap to Blog' and pick the trip. Bloggo builds the draft with your photos grouped by day and place.",
      },
      {
        title: "Add the words you want to keep",
        body: "Captions and day summaries end up in the book, so a sentence per day goes a long way.",
      },
      {
        title: "Export as PDF",
        body: "Tap 'Share Your Blog', then 'Export as PDF'. Bloggo lays out the storybook in one tap.",
      },
      {
        title: "Print it or send it",
        body: "Save the PDF, print it at home or a print shop, or send it to someone who was there.",
      },
    ],
    faqs: [
      {
        question: "Is the PDF export free?",
        answer:
          "Bloggo is free to download. Guests can export once; a free account unlocks unlimited exports.",
      },
      {
        question: "Are maps included?",
        answer:
          "Yes. Your trip's maps and routes are part of the storybook layout.",
      },
      {
        question: "Does the book leave my device?",
        answer: "Only when you share it. The PDF is generated on your iPhone.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/structured-travel-blog.png",
      alt: "A structured Bloggo travel blog with place cards, captions, and photos — the layout that becomes the PDF storybook",
    },
    related: [
      "turn-photos-into-travel-blog",
      "travel-video-slideshow-with-music",
      "private-travel-journal-app",
    ],
  },
  {
    slug: "travel-video-slideshow-with-music",
    keyword: "trip photos into a video slideshow with music",
    title: "How to turn trip photos into a video slideshow with music",
    metaDescription:
      "Turn your trip photos into a shareable video slideshow with music in one tap. Bloggo builds the video from your blog — no editing timeline required.",
    intro: [
      "A trip video shouldn't require a video editor. If your photos are already organized into a story, a slideshow with music is a rendering step, not a project.",
      "Bloggo generates a video slideshow from your trip blog — your photos in story order, set to music, ready to share — in one tap.",
    ],
    steps: [
      {
        title: "Create the trip blog first",
        body: "Tap 'Tap to Blog' and pick the trip. The video follows your blog's structure, so the story order is already set.",
      },
      {
        title: "Curate the moments",
        body: "Trim places or photos you don't want before exporting — the video matches the blog.",
      },
      {
        title: "Generate the video",
        body: "Tap 'Share Your Blog', then 'Stitch Reels'. Bloggo renders a slideshow video with music from your moments.",
      },
      {
        title: "Share it anywhere",
        body: "Save it to your camera roll or share directly to TikTok, Instagram, or wherever your people are.",
      },
    ],
    faqs: [
      {
        question: "Can I use it for reels and stories?",
        answer: "Yes. The vertical format is made for reels and stories.",
      },
      {
        question: "Do I pick the photos?",
        answer:
          "You control the blog, and the video follows it — hide a place or photo and it stays out of the video.",
      },
      {
        question: "Is the video rendered on my phone?",
        answer:
          "Yes. The slideshow is generated on your device, like the rest of your blog.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/share-carousel-pdf-video.png",
      alt: "Bloggo's share sheet with 'Stitch Reels' for generating a video slideshow from trip moments",
    },
    related: [
      "instagram-carousel-from-travel-photos",
      "travel-photo-book-from-iphone",
      "turn-photos-into-travel-blog",
    ],
  },
  {
    slug: "private-travel-journal-app",
    keyword: "private travel journal app that doesn't upload photos",
    title: "A private travel journal app that doesn't upload your photos",
    metaDescription:
      "Bloggo is a private, on-device travel journal. Your photos and blog drafts stay on your iPhone unless you choose to share — no feed, no followers, no uploads.",
    intro: [
      "Most journal apps are social apps in disguise: your photos go to a server, and your memories become content. If you want a travel journal that's actually yours, the test is simple — does it work without uploading anything?",
      "Bloggo is local first and private by default. Trip detection, blog drafts, maps — all built on your device from photo metadata. Nothing is shared unless you export or publish it yourself.",
    ],
    steps: [
      {
        title: "Start as a guest",
        body: "No account needed. Open Bloggo, let it scan your camera roll on-device, and create your first blog.",
      },
      {
        title: "Journal without a feed",
        body: "There are no followers, likes, or view counts. Your blogs are a private space, organized by trip and place.",
      },
      {
        title: "Keep everything on your iPhone",
        body: "Drafts live on your device. Sign in with a free account to lift the guest caps — the local-first privacy stays the same.",
      },
      {
        title: "Share only what you choose",
        body: "Export a carousel, PDF, or video when you want to share a trip. Until then, it's your eyes only.",
      },
    ],
    faqs: [
      {
        question: "Does Bloggo upload my photos?",
        answer:
          "No. Bloggo uses photo metadata like time and location, on your device, to organize trips. Your photos are never uploaded.",
      },
      {
        question: "Do I need an account?",
        answer:
          "No. Guests can save one blog and export once; a free account removes those caps.",
      },
      {
        question: "Is there a social feed?",
        answer: "No. Bloggo has no feed, follower counts, or likes.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/private-on-device-travel-map.png",
      alt: "A private on-device map in Bloggo showing photo pins across the United States",
    },
    related: [
      "travel-map-of-places-visited",
      "turn-camera-roll-into-diary",
      "photo-journal-app-for-everyday-life",
    ],
  },
  {
    slug: "travel-map-of-places-visited",
    keyword: "make a map of places you've traveled",
    title: "How to make a map of the places you've traveled",
    metaDescription:
      "See every place you've been on one map, built automatically from your photos. Bloggo tracks places visited by year and category — private and on-device.",
    intro: [
      "The best record of where you've been is already in your pocket: every photo with location data is a pin waiting for a map. You shouldn't have to place them by hand.",
      "Bloggo turns your camera roll into a places-visited tracker — every restaurant, trail, and city you photographed, browsable by year and category, plotted on a private map.",
    ],
    steps: [
      {
        title: "Let Bloggo scan your photos",
        body: "The on-device scan reads the location stored in each photo and builds your places list from it.",
      },
      {
        title: "Open 'Places Visited'",
        body: "Every place appears as a card with its photo, date, and category — skiing, restaurants, hiking, cafés.",
      },
      {
        title: "Filter by year or category",
        body: "Jump to 2024's restaurants or every trail you've ever hiked. The filters make the archive browsable.",
      },
      {
        title: "Switch to the map view",
        body: "See your pins across the country, and tap any trip to relive it.",
      },
    ],
    faqs: [
      {
        question: "Where does the location data come from?",
        answer:
          "From the metadata your iPhone saves with each photo. Bloggo reads it on your device.",
      },
      {
        question: "Can other people see my map?",
        answer:
          "No. The map is private and on-device. It's a record for you, not a feed for others.",
      },
      {
        question: "Does Bloggo track me in real time?",
        answer:
          "No. Bloggo only reads the location stored in photos you've already taken.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/places-visited-tracker.png",
      alt: "Bloggo's Places Visited screen with place cards filtered by year and category",
    },
    related: [
      "organize-travel-photos-by-trip",
      "private-travel-journal-app",
      "turn-photos-into-travel-blog",
    ],
  },
  {
    slug: "photo-journal-app-for-everyday-life",
    keyword: "photo journal app for everyday life",
    title: "A photo journal app for everyday life, not just trips",
    metaDescription:
      "Bloggo turns everyday photos — lunches, walks, weekends — into a photo journal organized by place. Automatic, private, and built from your camera roll.",
    intro: [
      "Most photo journals die because they demand daily effort: open the app, pick photos, write something. A journal should build itself from what you already capture.",
      "Bloggo isn't only for vacations. It groups your everyday photos by place — the new café, Sunday's hike, last week's dinner — into blogs you can keep private or share.",
    ],
    steps: [
      {
        title: "Keep taking photos like you already do",
        body: "Your camera roll is the journal's raw material. No check-ins, no daily prompts.",
      },
      {
        title: "Let Bloggo group your moments",
        body: "The on-device scan organizes photos by time and place, so everyday memories show up alongside the big trips.",
      },
      {
        title: "Blog on the go",
        body: "Use Bloggo's in-app camera and new photos flow straight into a draft while the day is fresh.",
      },
      {
        title: "Add a line when it matters",
        body: "'Describe your day in a sentence' is the whole ask. Some days, that's plenty.",
      },
    ],
    faqs: [
      {
        question: "Do short outings count?",
        answer:
          "Yes. Bloggo captures everyday moments and local places, not just multi-day travel.",
      },
      {
        question: "Can I journal without writing much?",
        answer:
          "Yes. The photos and places carry the structure; a sentence per day is enough.",
      },
      {
        question: "Is my everyday journal private?",
        answer:
          "Yes. Drafts stay on your device unless you export or publish them.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/my-blogs-home.png",
      alt: "Bloggo's My Blogs home screen with recent everyday blogs and the Tap to Blog shortcut",
    },
    related: [
      "turn-camera-roll-into-diary",
      "private-travel-journal-app",
      "travel-map-of-places-visited",
    ],
  },
  {
    slug: "turn-camera-roll-into-diary",
    keyword: "turn your camera roll into a diary",
    title: "How to turn your camera roll into a diary",
    metaDescription:
      "Your camera roll is already a diary — it just needs structure. Bloggo turns photos into dated, place-organized diary entries you can write on in seconds.",
    intro: [
      "If you take photos most days, you already keep a diary — it's just unstructured. Every shot carries a date, a place, and a memory; a diary is what you get when something organizes them and leaves room for your words.",
      "Bloggo turns your camera roll into exactly that: dated entries organized by place, with space for a sentence about the day and a story for any photo. Written on your device, kept on your device.",
    ],
    steps: [
      {
        title: "Scan your camera roll",
        body: "Open Bloggo and let the on-device scan find your days and trips. Years of photos become browsable entries.",
      },
      {
        title: "Open a day",
        body: "Each entry starts with your photos in order, grouped by where you were, with the date and even that day's weather.",
      },
      {
        title: "Describe the day in a sentence",
        body: "One line at the top of each day. That's the entire writing commitment.",
      },
      {
        title: "Tell one photo's story",
        body: "'What's the one thing you'd want to remember?' Tap a photo and answer.",
      },
    ],
    faqs: [
      {
        question: "Do I have to write every day?",
        answer: "No. The photos keep the record; write when a day deserves it.",
      },
      {
        question: "Can I backfill old days?",
        answer:
          "Yes. Bloggo scans your whole camera roll, so last year's days can become entries today.",
      },
      {
        question: "Is my diary private?",
        answer:
          "Yes. Entries live on your device and are never uploaded. Sharing is always your choice.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/write-your-travel-story.png",
      alt: "Bloggo's diary-style editor with a day summary field and a photo story prompt",
    },
    related: [
      "photo-journal-app-for-everyday-life",
      "turn-photos-into-travel-blog",
      "private-travel-journal-app",
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
