import queryString from 'query-string';
import { mergeRight } from 'ramda';
import requestPromise from 'request-promise-native';
import * as types from '@/lib/sumologic/types.js';

const defaultPaginationOptions: types.IPaginationOptions = {
  limit: 40,
  offset: 0,
};

export class Client {
  private httpClient: types.HttpClient;
  private params: types.IClientOptions;

  constructor(httpClient: types.HttpClient, params: types.IClientOptions) {
    this.httpClient = httpClient;
    this.params = params;
  }

  public job(params: types.IJobOptions): PromiseLike<types.IJob> {
    return this.httpClient.post(
      this.options({
        body: params,
        url: '/search/jobs',
      }),
    );
  }

  public status(id: string): PromiseLike<types.IStatus> {
    return this.httpClient.get(this.options({ url: `/search/jobs/${id}` }));
  }

  public messages(
    id: string,
    params: Partial<types.IPaginationOptions> = defaultPaginationOptions,
  ): PromiseLike<types.IMessages> {
    const query = this.paginationQuery(
      mergeRight(defaultPaginationOptions, params),
    );

    return this.httpClient.get(
      this.options({
        url: `/search/jobs/${id}/messages?${query}`,
      }),
    );
  }

  public records(
    id: string,
    params: Partial<types.IPaginationOptions> = defaultPaginationOptions,
  ): PromiseLike<types.IRecords> {
    const query = this.paginationQuery(
      mergeRight(defaultPaginationOptions, params),
    );

    return this.httpClient.get(
      this.options({
        url: `/search/jobs/${id}/records?${query}`,
      }),
    );
  }

  public delete(id: string): PromiseLike<void> {
    return this.httpClient.delete(this.options({ url: `/search/jobs/${id}` }));
  }

  private paginationQuery(params: types.IPaginationOptions): string {
    return queryString.stringify(params);
  }

  private options(options: types.IHttpCallOptions): types.HttpClientOptions {
    const defaultOptions = {
      auth: {
        pass: this.params.sumoApiKey,
        user: this.params.sumoApiId,
      },
      jar: true,
      json: true,
    };

    const endpoint = this.params.endpoint.endsWith('/')
      ? this.params.endpoint.slice(0, -1)
      : this.params.endpoint;
    const path = options.url?.startsWith('/') ? options.url : `/${options.url}`;

    const requestOptions = {
      ...options,
      url: endpoint + path,
    };

    const finalOptions = mergeRight(requestOptions, defaultOptions);

    // console.log('Debug - Request Options:', {
    //   endpoint: this.params.endpoint,
    //   path: options.url,
    //   finalUrl: finalOptions.url,
    //   auth: finalOptions.auth,
    //   body: finalOptions.body,
    //   fullOptions: finalOptions,
    // });

    return finalOptions;
  }
}

const client = (params: types.IClientOptions): Client =>
  new Client(requestPromise, params);

export { client };
export * from './types.js';
