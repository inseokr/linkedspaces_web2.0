import { transformToAllBlogItems } from "./src/views/Profile/recap-blogs/utils/tripDataTransform";

const trips: any[] = [
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

const items = transformToAllBlogItems(trips);
console.log(items);
