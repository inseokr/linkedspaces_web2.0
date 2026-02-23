const dateLabel = "2025";
const yearMatch = dateLabel?.match(/\b(19|20)\d{2}\b/);
const yearText = yearMatch?.[0] ?? "";
const dateWithoutYear = yearText
  ? dateLabel.replace(/,?\s*\b(19|20)\d{2}\b\s*$/, "").trim()
  : dateLabel;

console.log({ yearText, dateWithoutYear, dateLabel });

const dateLabel2 = "July 18 ~ July 20, 2025";
const yearMatch2 = dateLabel2?.match(/\b(19|20)\d{2}\b/);
const yearText2 = yearMatch2?.[0] ?? "";
const dateWithoutYear2 = yearText2
  ? dateLabel2.replace(/,?\s*\b(19|20)\d{2}\b\s*$/, "").trim()
  : dateLabel2;

console.log({
  yearText: yearText2,
  dateWithoutYear: dateWithoutYear2,
  dateLabel: dateLabel2,
});
