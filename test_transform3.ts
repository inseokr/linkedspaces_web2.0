import { transformToAllBlogItems } from "./src/views/Profile/recap-blogs/utils/tripDataTransform";
import fs from "fs";

// let's grab the trip data that the browser usually receives from the API
// Since I can't intercept it directly, I'll mock what could be missing
const trips = [
  {
    blogKey: "11",
    country: "South Korea",
    countryCode: "kr",
    startTimeString: "2025-07-18",
    endTimeString: "2025-07-20",
    startingYear: "2025",
    title: "Trip To Daegu in Winter",
  },
];

console.log(
  "ALL TAB (include year)",
  transformToAllBlogItems(trips, { includeYearInDateLabel: true }),
);
