import moment from 'moment';
import * as Sumo from '@/lib/sumologic/client.js';

export interface SearchResult {
  messages: any[];
}

interface SumoAPIError {
  statusCode?: number;
  message: string;
  error?: any;
  response?: {
    body: any;
  };
}

export async function search(
  client: Sumo.Client,
  query: string,
  timeRange?: { from?: string; to?: string },
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
    timeZone: 'Asia/Hong_Kong',
  };

  try {
    const { id } = await client.job(jobParams);

    // Wait for job completion
    let status;
    do {
      try {
        status = await client.status(id);
        if (status.state !== 'DONE GATHERING RESULTS') {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
        }
      } catch (statusError) {
        throw statusError;
      }
    } while (status.state !== 'DONE GATHERING RESULTS');

    // Get results
    const [messages] = await Promise.all([client.messages(id)]);
    console.log(messages);

    // Cleanup
    await client.delete(id);

    // Ensure messages are properly formatted for JSON serialization
    const sanitizedMessages = messages.messages.map((message) => {
      // Convert message.map to a plain object if it exists
      if (message.map && typeof message.map === 'object') {
        const plainMap: Record<string, string> = {};
        Object.keys(message.map).forEach((key) => {
          // Ensure values are strings and handle potential undefined values
          plainMap[key] = message.map[key]?.toString() || '';
        });
        return { map: plainMap };
      }
      return message;
    });

    return {
      messages: sanitizedMessages,
    };
  } catch (error) {
    const apiError = error as SumoAPIError;
    console.error('Error in search operation:', apiError.message);

    return {
      messages: [],
    };
  }
}
