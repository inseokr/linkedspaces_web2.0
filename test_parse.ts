import { formatTripDateRangeLabel } from "./src/utils/formatTripDate";
console.log(formatTripDateRangeLabel("July 18", "July 20"));
console.log(formatTripDateRangeLabel("July 18, 2025", "July 20, 2025"));
console.log(formatTripDateRangeLabel("Dec 12", "Dec 25"));
