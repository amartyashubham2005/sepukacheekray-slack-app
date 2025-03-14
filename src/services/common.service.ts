import axios from 'axios';
import ThreadMessageI from '../interfaces/threadMessages.interface';
import logger, { prettyJSON } from '../utils/logger';
import EnvService from './env.service';

class CommonService {

  public getBotAccessToken(): string {
    return EnvService.env().SLACK_BOT_TOKEN;
  }

  // Slack APIs
  public async postMessageInDm({
    botAccessToken,
    sink,
    text,
    ts,
    blocks,
    metadata,
  }: {
    botAccessToken: string;
    sink: string;
    text: string;
    ts?: string;
    blocks?: string;
    metadata?: string;
  }): Promise<
    | {
      message: ThreadMessageI;
      channel: string;
      ts: string;
      ok: boolean;
    }
    | undefined
  > {
    let body = {
      channel: sink,
      text,
      metadata,
    } as any;
    if (blocks) {
      body = {
        ...body,
        blocks,
      };
    }
    if (ts) {
      body = {
        ...body,
        thread_ts: ts,
      };
    }
    try {
      const response = await axios.post(
        `https://slack.com/api/chat.postMessage`,
        body,
        {
          headers: {
            Authorization: `Bearer ${botAccessToken}`,
          },
        }
      );
      if (!response || response.status != 200 || response.data.ok === false) {
        throw Error(
          `Failed to post chat, request body: ${prettyJSON(
            body
          )} response status: ${response.status} response data: ${prettyJSON(
            response.data
          )}`
        );
      }
      return response.data as {
        message: ThreadMessageI;
        channel: string;
        ts: string;
        ok: boolean;
      };
    } catch (e: any) {
      logger.error(`Error posting message to ${sink}`);
      logger.error(e.message);
      logger.error(prettyJSON(e));
    }
    return undefined;
  }

  public async updateMessage({
    botAccessToken,
    sink,
    ts,
    text,
    blocks,
    metadata,
  }: {
    botAccessToken: string;
    sink: string;
    ts: string;
    text: string;
    blocks?: string;
    metadata?: string;
  }): Promise<
    | {
      message: ThreadMessageI;
      channel: string;
      ts: string;
      ok: boolean;
    }
    | undefined
  > {
    let body = {
      channel: sink,
      text,
      ts,
      metadata,
    } as any;
    if (blocks) {
      body = {
        ...body,
        blocks,
      };
    }
    try {
      const response = await axios.post(
        `https://slack.com/api/chat.update`,
        body,
        {
          headers: {
            Authorization: `Bearer ${botAccessToken}`,
          },
        }
      );
      if (!response || response.status != 200 || response.data.ok === false) {
        throw Error(
          `Failed to update chat, request body: ${prettyJSON(
            body
          )} response status: ${response.status} response data: ${prettyJSON(
            response.data
          )}`
        );
      }
      return response.data as {
        message: ThreadMessageI;
        channel: string;
        ts: string;
        ok: boolean;
      };
    } catch (e: any) {
      logger.error(`Error updating message to ${sink}`);
      logger.error(e.message);
      logger.error(prettyJSON(e));
    }
    return undefined;
  }

  public async getUser({
    botAccessToken,
    userId,
  }: {
    botAccessToken: string;
    userId: string;
  }): Promise<
    | {
        ok: boolean;
        user: any;
      }
    | undefined
  > {
    try {
      const response = await axios.get(
        `https://slack.com/api/users.info?user=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${botAccessToken}`,
          },
        }
      );
      if (!response || response.status != 200 || response.data.ok === false) {
        throw Error(
          `Failed to get user, response status: ${
            response.status
          } response data: ${prettyJSON(response.data)}`
        );
      }
      return response.data;
    } catch (e: any) {
      logger.error(`Error getting user`);
      logger.error(e.message);
      logger.error(prettyJSON(e));
    }
    logger.error(`Failed to get messages from DM 2`);
    return undefined;
  }

}

export default CommonService;
