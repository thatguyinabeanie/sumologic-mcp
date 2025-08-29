import type { RequestAPI, RequiredUriUrl, Options } from 'request';
import type {
  RequestPromise,
  RequestPromiseOptions,
} from 'request-promise-native';

// Sumo Logic Search Job API Types
// Based on official documentation: https://help.sumologic.com/docs/api/search-job/

export interface SearchJobRequest {
  query: string;
  from: string;
  to: string;
  timeZone: string;
  byReceiptTime?: boolean;
  autoParsingMode?: 'AutoParse' | 'Manual';
  requiresRawMessages?: boolean;
}

export interface SearchJobResponse {
  id: string;
  link: {
    rel: string;
    href: string;
  };
  warning?: string;
}

export interface HistogramBucket {
  length: number;
  count: number;
  startTimestamp: number;
}

export interface UsageDetails {
  dataScannedInBytes: number;
}

export interface SearchJobStatus {
  state:
    | 'NOT STARTED'
    | 'GATHERING RESULTS'
    | 'GATHERING RESULTS FROM SUBQUERIES'
    | 'FORCE PAUSED'
    | 'DONE GATHERING RESULTS'
    | 'DONE GATHERING HISTOGRAM'
    | 'CANCELLED';
  messageCount: number;
  recordCount: number;
  warning?: string;
  pendingErrors: string[];
  pendingWarnings: string[];
  histogramBuckets: HistogramBucket[];
  usageDetails: UsageDetails;
}

export interface MessageField {
  name: string;
  fieldType: 'string' | 'long' | 'int' | 'double' | 'boolean';
  keyField: boolean;
}

export interface LogMessage {
  map: Record<string, string>;
  _raw?: string;
  response?: string;
  [key: string]: string | Record<string, string> | undefined;
}

export interface SearchJobMessagesResponse {
  warning?: string;
  fields: MessageField[];
  messages: LogMessage[];
}

export interface AggregationRecord {
  map: Record<string, string | number>;
}

export interface SearchJobRecordsResponse {
  warning?: string;
  fields: MessageField[];
  records: AggregationRecord[];
}

// Client configuration and authentication types
export interface SumoLogicConfig {
  endpoint: string;
  accessId: string;
  accessKey: string;
  timeout?: number;
}

export interface SumoLogicError {
  statusCode: number;
  message: string;
  error?: string;
  response?: {
    body: string;
  };
}

// Legacy interface compatibility (for existing code)
export interface IJob {
  status: number;
  id: string;
  code: string;
  message: string;
}

export type IHistogramBucket = HistogramBucket;

export interface IStatus {
  state: string; // Legacy compatibility - allow any string
  messageCount: number;
  recordCount: number;
  warning?: string;
  pendingErrors: string[];
  pendingWarnings: string[];
  histogramBuckets: IHistogramBucket[];
  usageDetails: UsageDetails;
}

export interface IField {
  name: string;
  fieldType: string; // Legacy compatibility - allow any string
  keyField: boolean;
}

export type IMessage = LogMessage;

export type IMessages = SearchJobMessagesResponse;

export interface IRecords {
  warning?: string;
  fields: MessageField[];
  records: IMessage[]; // Legacy compatibility
}

// HTTP client types
export type HttpClient = RequestAPI<
  RequestPromise,
  RequestPromiseOptions,
  RequiredUriUrl
>;

export interface IClientOptions {
  endpoint: string;
  sumoApiId: string;
  sumoApiKey: string;
}

export type IJobOptions = SearchJobRequest;

export interface IHttpCallOptions {
  url?: string;
  body?: Record<string, unknown> | IJobOptions;
}

export interface IPaginationOptions {
  offset: number;
  limit: number;
}

export type HttpClientOptions = Options;

// Search result types for our domain layer
export interface SearchResult {
  messages: ProcessedMessage[];
}

export interface ProcessedMessage {
  map?: Record<string, string>;
  _messageId?: string;
  _sourceId?: string;
  _sourceName?: string;
  _sourceHost?: string;
  _sourceCategory?: string;
  _format?: string;
  _size?: string;
  _messageTime?: string;
  _receiptTime?: string;
  _messageCount?: string;
  _raw?: string;
  _source?: string;
  _collectorId?: string;
  _collector?: string;
  _blockId?: string;
  response?: string;
  [key: string]: string | Record<string, string> | undefined;
}
