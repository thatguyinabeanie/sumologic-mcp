/**
 * Masks sensitive information in a string
 * @param text The text to mask sensitive information in
 * @returns The text with sensitive information masked
 */
export function maskSensitiveInfo(text: string): string {
  if (typeof text !== 'string') return text;

  // Helper function to validate if a string is likely a phone number
  const isLikelyPhoneNumber = (str: string): boolean => {
    // Remove all non-digit characters
    const digitsOnly = str.replace(/\D/g, '');
    // Check if the resulting string has a reasonable number of digits for a phone number
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  };

  // Function to check if a match is part of a URL
  const isPartOfUrl = (match: string, fullText: string): boolean => {
    // Find the position of the match in the full text
    const matchIndex = fullText.indexOf(match);
    if (matchIndex === -1) return false;

    // Check if the match is part of a URL by looking for common URL patterns before it
    const textBeforeMatch = fullText.substring(0, matchIndex);
    const urlPrefixRegex = /https?:\/\/[^\s]*$/;
    return urlPrefixRegex.test(textBeforeMatch);
  };

  // Email pattern
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

  // Credit card patterns (more specific to major card types)
  // Visa: 13 or 16 digits, starts with 4
  // Mastercard: 16 digits, starts with 51-55 or 2221-2720
  // American Express: 15 digits, starts with 34 or 37
  // Discover: 16 digits, starts with 6011, 622126-622925, 644-649, or 65
  const creditCardPatterns = [
    /\b4[0-9]{12}(?:[0-9]{3})?\b/g, // Visa
    /\b(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}\b/g, // Mastercard
    /\b3[47][0-9]{13}\b/g, // American Express
    /\b(?:6011|65[0-9]{2}|64[4-9][0-9]|6221[0-9]{2}|6222[0-9]{2}|6223[0-9]{2}|6224[0-9]{2}|6225[0-9]{2}|6226[0-9]{2}|6227[0-9]{2}|6228[0-9]{2}|6229[0-9]{2})[0-9]{10,12}\b/g, // Discover
    // Generic pattern for other cards or when digits are separated
    /\b(?:\d[ -]*?){13,16}\b/g,
  ];

  // Phone number patterns (various formats) - Order matters: most specific first
  const phonePatterns = [
    // International formats with + country code and parentheses (covers +44 (0) 7876163246)
    /\+\d{1,4}\s*\(\d{1,4}\)\s*\d{4,15}/g,

    // US format with parentheses (123) 456-7890
    /\(\d{3}\)\s*\d{3}[.-]?\d{4}/g,

    // International formats with + country code (covers +528008770427, +61468613312, etc.)
    /\+\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{4,15}/g,

    // US/Canada formats 800-555-1234, 123-456-7890
    /\d{3}[.-]\d{3}[.-]\d{4}/g,

    // Numbers with slashes (like +971 4 5096466/96/86)
    /\+\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,14}(?:\/\d{1,4})+/g,

    // US/Canada with country code 1 (without +)
    /\b1[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,

    // Additional patterns to catch more formats:

    // International numbers with spaces and no plus (like 44 20 3051 303)
    /\b\d{1,4}\s\d{1,4}\s\d{1,4}\s\d{1,4}\b/g,

    // Numbers with multiple slashes or extensions (like 5096466/96/86)
    /\b\d{6,10}(?:\/\d{1,4}){1,5}\b/g,

    // Numbers with plus and multiple groups (like +44 7867 254482)
    /\+\d{1,4}\s\d{4}\s\d{6}/g,

    // Numbers with country code and area code in parentheses (like +1(123)456-7890)
    /\+\d{1,4}\(\d{3}\)\d{3}[-]?\d{4}/g,

    // International numbers with specific formats seen in the data
    /\+\d{1,4}\s?\d{1,4}\s?\d{4}\s?\d{4}/g,

    // Specific formats from the JSON data
    /\+[0-9]{10,15}/g, // Simple international numbers like +528008770427
    /\+\d{1,4}\s?\d{1,4}\s?\d{1,4}\s?\d{1,4}/g, // Format like +971 4 5096466
    /\b\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}\b/g, // Generic number pattern with spaces or hyphens
  ];

  // Address patterns
  const addressPatterns = [
    // US/Canada style addresses
    /\b\d+\s+[A-Za-z0-9\s,.-]+(?:Avenue|Ave|Street|St|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Plaza|Plz|Square|Sq)\b/gi,
    // PO Box
    /\bP\.?O\.?\s*Box\s+\d+\b/gi,
    // Postal/ZIP codes
    /\b[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}\b/g, // UK Postal Code
    /\b\d{5}(?:-\d{4})?\b/g, // US ZIP Code
  ];

  // Social Security Number (US)
  const ssnPattern = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;

  // Replace each pattern with a masked version
  let maskedText = text;

  // Mask emails
  const emailMatches = text.match(emailPattern) || [];
  if (emailMatches.length > 0) {
    maskedText = maskedText.replace(emailPattern, '[EMAIL REDACTED]');
  }

  // Mask credit cards
  creditCardPatterns.forEach((pattern) => {
    maskedText = maskedText.replace(pattern, '[CARD NUMBER REDACTED]');
  });

  // Mask SSNs BEFORE phone numbers to avoid conflicts
  maskedText = maskedText.replace(ssnPattern, '[SSN REDACTED]');

  // Mask phone numbers
  phonePatterns.forEach((pattern) => {
    maskedText = maskedText.replace(pattern, (match, _offset, string) => {
      // Skip masking if the match is part of a URL
      if (isPartOfUrl(match, string)) {
        return match;
      }
      return isLikelyPhoneNumber(match) ? '[PHONE REDACTED]' : match;
    });
  });

  // Additional pass for phone numbers that might have been missed
  // This helps catch any phone numbers that might have been missed due to overlapping patterns
  let previousMaskedText = '';
  while (previousMaskedText !== maskedText) {
    previousMaskedText = maskedText;
    phonePatterns.forEach((pattern) => {
      maskedText = maskedText.replace(pattern, (match, _offset, string) => {
        // Skip masking if the match is part of a URL
        if (isPartOfUrl(match, string)) {
          return match;
        }
        return isLikelyPhoneNumber(match) ? '[PHONE REDACTED]' : match;
      });
    });
  }

  // Mask addresses
  addressPatterns.forEach((pattern) => {
    maskedText = maskedText.replace(pattern, '[ADDRESS REDACTED]');
  });

  return maskedText;
}
