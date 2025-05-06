// Import the function and pattern directly from the controller
// In a real-world scenario, these might be exported separately for better testability
import isValidDate from "../utils/isValidDate.js";
import convertToISODate from "../utils/convertToISODate.js";

describe("Date Conversion Unit Tests", () => {
  // Test the datePattern regular expression
  describe("isValidDate regex validation", () => {
    test("should match valid DD/MM/YYYY date format", () => {
      const validDates = [
        "01/01/2024",
        "31/12/2024",
        "15/06/2025",
        "29/02/2024", // Leap year
      ];

      validDates.forEach((date) => {
        expect(isValidDate(date)).toBe(true);
      });
    });

    test("should reject invalid date formats", () => {
      const invalidDates = [
        "2024-01-01T00:00:00Z", // ISO format with time
        "2024-01-01", // ISO format
        "01-01-2024", // Using dashes
        "1/1/2024", // Single digits without leading zeros
        "32/01/2024", // Invalid day
        "01/13/2024", // Invalid month
        "00/00/0000", // All zeros
        "aa/bb/cccc", // Non-numeric
        "01/01/24", // 2-digit year
        "30/02/2023", // Non-leap year
      ];

      invalidDates.forEach((date) => {
        expect(isValidDate(date)).toBe(false);
      });
    });
  });

  // Test the convertToISODate function
  describe("convertToISODate function", () => {
    test("should convert UK date format (DD/MM/YYYY) to ISO format (YYYY-MM-DD)", () => {
      const testCases = [
        { input: "01/01/2024", expected: "2024-01-01" },
        { input: "31/12/2024", expected: "2024-12-31" },
        { input: "15/06/2025", expected: "2025-06-15" },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(convertToISODate(input)).toBe(expected);
      });
    });

    test("should handle different date parts correctly", () => {
      // Testing with single-digit days and months (though these wouldn't pass the regex validation)
      // This is to ensure the function itself works correctly with different input patterns
      const testCases = [
        { input: "01/02/2024", expected: "2024-02-01" }, // Different day/month
        { input: "10/11/2023", expected: "2023-11-10" }, // Different year
      ];

      testCases.forEach(({ input, expected }) => {
        expect(convertToISODate(input)).toBe(expected);
      });
    });
  });
});
