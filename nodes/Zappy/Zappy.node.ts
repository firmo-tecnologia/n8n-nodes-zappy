import {
  IDataObject,
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

import { zappyApiRequest } from './GenericFunctions';

export class Zappy implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Zappy',
    name: 'zappy',
    icon: 'file:zappy.svg',
    group: ['output'],
    version: 1,
    subtitle: '=Send {{$parameter["type"]}} message',
    description: 'Send WhatsApp messages via Zappy API',
    defaults: { name: 'Zappy' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'zappyApi', required: true }],
    properties: [
      {
        displayName: 'Instance',
        name: 'instanceId',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getInstances' },
        default: '',
        required: true,
        description: 'The WhatsApp instance to send from',
      },
      {
        displayName: 'To',
        name: 'to',
        type: 'string',
        default: '',
        required: true,
        placeholder: '5511999999999',
        description: 'Recipient phone number (country code + number, no +)',
      },
      {
        displayName: 'Message Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Text', value: 'text' },
          { name: 'Image', value: 'image' },
          { name: 'Document', value: 'document' },
        ],
        default: 'text',
      },
      {
        displayName: 'Content',
        name: 'content',
        type: 'string',
        typeOptions: { rows: 4 },
        displayOptions: { show: { type: ['text'] } },
        default: '',
        required: true,
      },
      {
        displayName: 'File Data (Base64)',
        name: 'data',
        type: 'string',
        displayOptions: { show: { type: ['image', 'document'] } },
        default: '',
        required: true,
      },
      {
        displayName: 'MIME Type',
        name: 'mimeType',
        type: 'string',
        displayOptions: { show: { type: ['image', 'document'] } },
        default: '',
        required: true,
        placeholder: 'image/jpeg',
      },
      {
        displayName: 'Caption',
        name: 'caption',
        type: 'string',
        displayOptions: { show: { type: ['image', 'document'] } },
        default: '',
      },
      {
        displayName: 'Filename',
        name: 'filename',
        type: 'string',
        displayOptions: { show: { type: ['document'] } },
        default: '',
      },
    ],
  };

  methods = {
    loadOptions: {
      async getInstances(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const instances = (await zappyApiRequest.call(this, 'GET', '/instances')) as IDataObject[];
        return instances.map((instance) => ({
          name: `${instance.name as string} (${instance.status as string})`,
          value: instance.id as string,
        }));
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const instanceId = this.getNodeParameter('instanceId', i) as string;
        const to = this.getNodeParameter('to', i) as string;
        const type = this.getNodeParameter('type', i) as string;
        const body: IDataObject = { to, type };

        if (type === 'text') {
          body.content = this.getNodeParameter('content', i) as string;
        } else {
          body.data = this.getNodeParameter('data', i) as string;
          body.mime_type = this.getNodeParameter('mimeType', i) as string;
          const caption = this.getNodeParameter('caption', i, '') as string;
          if (caption) body.caption = caption;
          const filename = this.getNodeParameter('filename', i, '') as string;
          if (filename) body.filename = filename;
        }

        const responseData = await zappyApiRequest.call(
          this,
          'POST',
          `/instances/${instanceId}/messages`,
          body,
        );

        returnData.push(...this.helpers.returnJsonArray([responseData]));
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
