import { transformToAllBlogItems } from "./src/views/Profile/recap-blogs/utils/tripDataTransform";

// Mock missing data fields as seen in API (e.g. no endTimestamp, just startTimeString)
const trips = [
  {
    blogKey: "11",
    country: "South Korea",
    countryCode: "kr",
    startTimeString: "July 18",
    endTimeString: "July 20",
    startingYear: "2025",
    title: "Trip To Daegu in Winter",
  },
];

console.log(
  "ALL TAB (include year)",
  transformToAllBlogItems(trips, { includeYearInDateLabel: true }),
);
console.log(
  "2025 TAB (no year)",
  transformToAllBlogItems(trips, { includeYearInDateLabel: false }),
);
