import { transformToAllBlogItems } from "./src/views/Profile/recap-blogs/utils/tripDataTransform";

const trips = [
  {
    blogKey: "11",
    country: "South Korea",
    countryCode: "kr",
    startTimeString: "",
    endTimeString: "",
    startingYear: "2025",
    title: "Trip To Daegu in Winter",
  },
];

console.log(
  "ALL TAB (include year)",
  transformToAllBlogItems(trips, { includeYearInDateLabel: true }),
);
