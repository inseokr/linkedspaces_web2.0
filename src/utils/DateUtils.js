///////////////////////////////////////////////////////////////////////////////////////
// Utilities - Date & Time
///////////////////////////////////////////////////////////////////////////////////////
export function numberToMonth(number) {
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "July",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    // Check if the input is a valid number (between 1 and 12)
    if (number < 1 || number > 12 || !Number.isInteger(number)) {
        return "Invalid input. Please enter a number between 1 and 12.";
    }

    // Return the corresponding month name
    return months[number - 1];
}

export function convertTo12Hour(timeStr) {
    let [hours, minutes] = timeStr.split(":").map(Number);
    let period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function formatDate(dateStr) {
    // Split the input string into date and time parts
    const [datePart, timePart] = dateStr.split(' ');

    // 2024:12:05 10:44:44 ==> 
    var year = datePart.split(':')[0];
    var month = datePart.split(':')[1];
    var day = datePart.split(':')[2];

    return `${numberToMonth(parseInt(month))} ${parseInt(day)}, ${year} at ${convertTo12Hour(timePart)}`
}

// ex> 2022:09:23
// ==> 9/23/2022
export const reformatDate = (dateStr) => {
    const [year, month, day] = dateStr.split(':');
    return `${numberToMonth(parseInt(month))}/${parseInt(day)} ${year}`;
}
