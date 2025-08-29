import { maskSensitiveInfo } from './pii';

describe('maskSensitiveInfo', () => {
  // Test case for email masking
  test('should mask email addresses', () => {
    const text = 'Contact me at john.doe@example.com for more details.';
    const expected = 'Contact me at [EMAIL REDACTED] for more details.';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  // Test case for multiple email addresses
  test('should mask multiple email addresses', () => {
    const text = 'Emails are test@example.com and another.one@work.co.uk.';
    const expected = 'Emails are [EMAIL REDACTED] and [EMAIL REDACTED].';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  // Test cases for credit card masking
  test('should mask Visa credit card numbers', () => {
    const text = 'Visa card: 4111222233334444';
    const expected = 'Visa card: [CARD NUMBER REDACTED]';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  test('should mask Mastercard credit card numbers', () => {
    const text = 'Mastercard: 5412345678901234';
    const expected = 'Mastercard: [CARD NUMBER REDACTED]';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  test('should mask American Express credit card numbers', () => {
    const text = 'AMEX: 371234567890123';
    const expected = 'AMEX: [CARD NUMBER REDACTED]';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  test('should mask Discover credit card numbers', () => {
    const text = 'Discover card: 6011123456789012';
    const expected = 'Discover card: [CARD NUMBER REDACTED]';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  test('should mask credit card numbers with spaces or hyphens', () => {
    const text = 'Card: 4111-2222-3333-4444, another is 5123 4567 8901 2345';
    const expected =
      'Card: [CARD NUMBER REDACTED], another is [CARD NUMBER REDACTED]';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  // Test cases for phone number masking
  test('should mask standard US phone numbers', () => {
    const text = 'Call me at 800-555-1234 or (123) 456-7890.';
    const expected = 'Call me at [PHONE REDACTED] or [PHONE REDACTED].';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  test('should mask international phone numbers', () => {
    const text = 'International number: +44 (0) 7876163246';
    const expected = 'International number: [PHONE REDACTED]';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  test('should not mask numbers that are not likely phone numbers', () => {
    const text = 'Order number 123456 should not be masked.';
    expect(maskSensitiveInfo(text)).toBe(text);
  });

  test('should not mask phone-like numbers in URLs', () => {
    const text = 'Go to https://example.com/api/v1/users/1234567890';
    expect(maskSensitiveInfo(text)).toBe(text);
  });

  // Test case for SSN masking
  test('should mask Social Security Numbers', () => {
    const text = 'My SSN is 123-45-6789.';
    const expected = 'My SSN is [SSN REDACTED].';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  test('should mask SSNs without hyphens', () => {
    const text = 'SSN: 123456789.';
    const expected = 'SSN: [SSN REDACTED].';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  // Test case for address masking
  test('should mask street addresses', () => {
    const text = 'Visit us at 123 Main Street, Anytown, USA.';
    const expected = 'Visit us at [ADDRESS REDACTED], Anytown, USA.';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  test('should mask PO Box addresses', () => {
    const text = 'Send mail to P.O. Box 12345.';
    const expected = 'Send mail to [ADDRESS REDACTED].';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  // Test case for mixed PII
  test('should mask multiple types of PII in one string', () => {
    const text =
      'John Doe, email: john.doe@example.com, phone: 123-456-7890, address: 456 Oak Avenue, ssn: 987-65-4321';
    const expected =
      'John Doe, email: [EMAIL REDACTED], phone: [PHONE REDACTED], address: [ADDRESS REDACTED], ssn: [SSN REDACTED]';
    expect(maskSensitiveInfo(text)).toBe(expected);
  });

  // Test case for text with no PII
  test('should not modify text with no PII', () => {
    const text = 'This is a safe message with no sensitive information.';
    expect(maskSensitiveInfo(text)).toBe(text);
  });

  // Test case for empty string
  test('should return an empty string if input is empty', () => {
    const text = '';
    expect(maskSensitiveInfo(text)).toBe('');
  });

  // Test case for non-string input
  test('should return the input as is if it is not a string', () => {
    const notAString: any = { message: 'this is an object' };
    expect(maskSensitiveInfo(notAString)).toBe(notAString);
  });
});
