import {
  IDataObject,
  IHookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
} from 'n8n-workflow';

import { zappyApiRequest } from '../Zappy/GenericFunctions';

export class ZappyTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Zappy Trigger',
    name: 'zappyTrigger',
    icon: 'file:zappy.svg',
    group: ['trigger'],
    version: 1,
    description: 'Triggers when Zappy receives WhatsApp events',
    defaults: { name: 'Zappy Trigger' },
    inputs: [],
    outputs: ['main'],
    credentials: [{ name: 'zappyApi', required: true }],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Instance ID',
        name: 'instanceId',
        type: 'string',
        default: '',
        required: true,
        description: 'ID of the WhatsApp instance to listen for events. Find it in your Zappy dashboard.',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      },
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        options: [
          { name: 'Message Received', value: 'message.received' },
          { name: 'Message Sent', value: 'message.sent' },
          { name: 'Connection Update', value: 'connection.update' },
          { name: 'Message Ack', value: 'message.ack' },
        ],
        default: ['message.received'],
        required: true,
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const instanceId = this.getNodeParameter('instanceId') as string;
        const webhookUrl = this.getNodeWebhookUrl('default');
        const webhookData = this.getWorkflowStaticData('node');

        const webhooks = (await zappyApiRequest.call(
          this,
          'GET',
          `/instances/${instanceId}/webhooks`,
        )) as IDataObject[];

        if (!Array.isArray(webhooks)) return false;

        for (const webhook of webhooks) {
          if (webhook.url === webhookUrl) {
            webhookData.webhookId = webhook.id;
            return true;
          }
        }

        return false;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const instanceId = this.getNodeParameter('instanceId') as string;
        const events = this.getNodeParameter('events') as string[];
        const webhookUrl = this.getNodeWebhookUrl('default');
        const webhookData = this.getWorkflowStaticData('node');

        const webhook = (await zappyApiRequest.call(
          this,
          'POST',
          `/instances/${instanceId}/webhooks`,
          { url: webhookUrl, events },
        )) as IDataObject;

        webhookData.webhookId = webhook.id;
        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const instanceId = this.getNodeParameter('instanceId') as string;
        const webhookData = this.getWorkflowStaticData('node');

        if (webhookData.webhookId) {
          try {
            await zappyApiRequest.call(
              this,
              'DELETE',
              `/instances/${instanceId}/webhooks/${webhookData.webhookId}`,
            );
          } catch (_error) {
            return false;
          }
          delete webhookData.webhookId;
        }

        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const body = this.getBodyData();
    return {
      workflowData: [[{ json: body as IDataObject }]],
    };
  }
}
