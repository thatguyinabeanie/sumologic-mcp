import moment from 'moment';
import * as Sumo from '@/lib/sumologic/client.js';
import { maskSensitiveInfo } from '@/utils/pii.js';
import type { SearchResult, ProcessedMessage } from '@/lib/sumologic/types.js';

export type { SearchResult } from '@/lib/sumologic/types.js';

export async function search(
  client: Sumo.Client,
  query: string,
  timeRange?: { from?: string; to?: string },
  timeZone?: string,
): Promise<SearchResult> {
  const now = moment();
  const defaultTimeRange = {
    from: now.subtract(1, 'day').format(),
    to: now.format(),
  };

  const { from, to } = { ...defaultTimeRange, ...timeRange };

  // Create search job
  const jobParams = {
    query,
    from,
    to,
    timeZone: timeZone || process.env.TZ || 'UTC',
  };

  try {
    const { id } = await client.job(jobParams);

    // Wait for job completion
    let status;
    do {
      status = await client.status(id);
      if (status.state !== 'DONE GATHERING RESULTS') {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      }
    } while (status.state !== 'DONE GATHERING RESULTS');

    // Get results
    const [messages] = await Promise.all([client.messages(id)]);

    // Cleanup
    await client.delete(id);

    // Ensure messages are properly formatted for JSON serialization and filter PII
    const sanitizedMessages = messages.messages.map(
      (message): ProcessedMessage => {
        // Convert message.map to a plain object if it exists
        if (message.map && typeof message.map === 'object') {
          const plainMap: Record<string, string> = {};
          Object.keys(message.map).forEach((key) => {
            // Ensure values are strings and handle potential undefined values
            const rawValue = message.map[key]?.toString() || '';

            // Only apply PII masking to _raw and response fields
            if (key === '_raw' || key === 'response') {
              plainMap[key] = maskSensitiveInfo(rawValue);
            } else {
              plainMap[key] = rawValue;
            }
          });

          // Also mask the _raw property if it exists at the top level
          const maskedRaw = message._raw
            ? maskSensitiveInfo(message._raw.toString())
            : undefined;

          return {
            ...message,
            map: plainMap,
            _raw: maskedRaw,
          } as ProcessedMessage;
        }

        // If message has a _raw property (contains raw log text)
        if (message._raw && typeof message._raw === 'string') {
          return {
            ...message,
            _raw: maskSensitiveInfo(message._raw),
          } as ProcessedMessage;
        }

        // If message has a response property
        if (message.response && typeof message.response === 'string') {
          return {
            ...message,
            response: maskSensitiveInfo(message.response),
          } as ProcessedMessage;
        }

        // If message is a string, don't apply PII masking
        if (typeof message === 'string') {
          return { _raw: message } as ProcessedMessage;
        }

        // If message is an object, only filter _raw and response fields
        if (typeof message === 'object' && message !== null) {
          const result = { ...message } as ProcessedMessage;

          if (result._raw && typeof result._raw === 'string') {
            result._raw = maskSensitiveInfo(result._raw);
          }

          if (result.response && typeof result.response === 'string') {
            result.response = maskSensitiveInfo(result.response);
          }

          return result;
        }

        // For other message formats, return as is
        return message as ProcessedMessage;
      },
    );

    return {
      messages: sanitizedMessages,
    };
  } catch {
    return {
      messages: [],
    };
  }
}
