const isValidDate = (dateStr) => {
  // Check if the date string matches the DD/MM/YYYY format
  const basicPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!basicPattern.test(dateStr)) {
    return false;
  }

  // Extract day, month, and year as numbers
  const [day, month, year] = dateStr.split("/").map(Number);

  // Validate month range (1-12)
  if (month < 1 || month > 12) {
    return false;
  }

  // Determine days in each month, accounting for leap years
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [
    31, // January
    isLeapYear ? 29 : 28, // February (leap year dependent)
    31, // March
    30, // April
    31, // May
    30, // June
    31, // July
    31, // August
    30, // September
    31, // October
    30, // November
    31, // December
  ];

  // Validate day range (1 to max days in the month)
  if (day < 1 || day > daysInMonth[month - 1]) {
    return false;
  }

  // All validations passed
  return true;
};

export default isValidDate;
