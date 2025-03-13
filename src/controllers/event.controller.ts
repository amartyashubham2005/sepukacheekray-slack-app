import express from 'express';
import Controller from '../interfaces/controller.interface';
import slackAuthMiddleware from '../middleware/slackAuth.middleware';
import EventPayloadI from '../interfaces/eventPayload.interface';
import logger from '../utils/logger';
import CommonService from '../services/common.service';
import { IMMEDIATE_ACK_REPLY_TEXT } from '../constants';
import WsService from '../services/ws.service';
import SQLiteManager from '../services/sqliteManager.service';

class EventController implements Controller {
  public router = express.Router();
  public commonService = new CommonService();
  public wsService = new WsService();
  public sqliteManager = new SQLiteManager();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`/event`, slackAuthMiddleware, this.processEvent);
  }

  private processEvent = async (
    request: express.Request,
    response: express.Response
  ) => {
    // Handle URL verification
    if (request.body.type === 'url_verification') {
      response.send(request.body.challenge);
      return;
    }

    logger.info('Event received from Slack : ' + JSON.stringify(request.body));

    // Immediate response to Slack
    response.send();

    // Process the event
    const body: EventPayloadI = request.body;
    const event = body.event;

    // Prevent processing bot's own messages
    if (event.bot_id || event.user === process.env.SLACK_BOT_USER_ID) {
      return;
    }

    try {
      // Determine message type and extract context accordingly
      if (event.type === 'message') {
        if (event.channel_type === 'im') {
          await this.handleDirectMessage(body);
        } else {
          // Ignore other message types
          logger.info(
            `Ignoring message with ts ${event.ts} channel ${event.channel} team ${body.team_id}`
          );
        }
      }
    } catch (error) {
      logger.error('Error processing Slack event:');
    }
  };

  private async handleDirectMessage(body: EventPayloadI) {
    const botAccessToken = this.commonService.getBotAccessToken();
    const postMessageResponse = await this.commonService.postMessageInDm({
      botAccessToken,
      sink: body.event.user,
      text: IMMEDIATE_ACK_REPLY_TEXT,
    });
    await this.wsService.sendMessageToWs({
      slackUserId: body.event.user,
      slackChannelId: body.event.channel,
      slackTeamId: body.team_id,
      messageText: body.event.text ?? '',
      // threadTs: postMessageResponse?.message.thread_ts ?? '',
      ts: postMessageResponse?.message.ts ?? '',
      commonService: this.commonService,
      sqliteManager: this.sqliteManager,
    });
  }

}

export default EventController;
