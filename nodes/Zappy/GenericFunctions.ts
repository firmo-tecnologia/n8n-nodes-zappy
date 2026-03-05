import {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
  NodeApiError,
} from 'n8n-workflow';

type ZappyContext =
  | IExecuteFunctions
  | IHookFunctions
  | ILoadOptionsFunctions
  | IWebhookFunctions;

export async function zappyApiRequest(
  this: ZappyContext,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  qs?: IDataObject,
): Promise<any> {
  const credentials = await this.getCredentials('zappyApi');
  const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

  const options: IHttpRequestOptions = {
    method,
    url: `${baseUrl}/v1${endpoint}`,
    headers: {
      Authorization: `Bearer ${credentials.apiKey as string}`,
    },
    json: true,
  };

  if (body && Object.keys(body).length > 0) {
    options.body = body;
  }

  if (qs && Object.keys(qs).length > 0) {
    options.qs = qs;
  }

  try {
    return await this.helpers.httpRequest(options);
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as any);
  }
}
