import logger, { prettyJSON } from '../utils/logger';
import EnvService from './env.service';
import WebSocket from 'ws';
import CommonService from './common.service';
import SQLiteManager from './sqliteManager.service';
import { MAX_BATCH_SIZE } from '../constants';

class WsService {

  public async sendMessageToWs({
    slackUserId,
    slackUserRealName,
    slackChannelId,
    slackTeamId,
    messageText,
    ts,
    commonService,
    sqliteManager,
  }: {
    slackUserId: string;
    slackUserRealName: string;
    slackChannelId: string;
    slackTeamId: string;
    messageText: string;
    ts: string;
    commonService: CommonService;
    sqliteManager: SQLiteManager;
  }) {
    logger.info('Sending message to DocsBot WS');
    let response = '';
    let currentBatchSize = 0;
    const ws = new WebSocket(EnvService.env().DOCSBOT_WS_URL);
    // Send message to server when connection is established
    ws.onopen = function (_event) {
      logger.info('Connected to DocsBot WS');
      sqliteManager.getOrCreateHistory(slackUserId, slackTeamId)
        .then((history) => {
          this.send(JSON.stringify({ question: messageText, full_source: false, history: JSON.parse(history), metadata: { name: slackUserRealName } }));
        });
    }

    ws.onerror = function (error) {
      logger.error('WebSocket error:', error);
    }

    // Receive message from server word by word. Display the words as they are received.
    ws.onmessage = function (event) {
      const data = JSON.parse(event.data.toString());
      logger.info(prettyJSON(data));
      if (data.sender === 'bot') {
        if (data.type === 'start') {
          // Noop
        } else if (data.type === 'stream') {
          //this is a streaming response word by word, it will be sent many times. Update the UI by appending these messages to the current answer.
          response += data.message;
          currentBatchSize++;
          if (currentBatchSize >= MAX_BATCH_SIZE) {
            commonService.updateMessage({
              botAccessToken: commonService.getBotAccessToken(),
              sink: slackChannelId,
              ts,
              text: response,
            });
            currentBatchSize = 0;
          }
        } else if (data.type === 'info') {
          // Noop
        } else if (data.type === 'end') {
          //this is the final response containing all data, it will be sent once after streaming completes. Update the UI with the final answer and sources.

          commonService.updateMessage({
            botAccessToken: commonService.getBotAccessToken(),
            sink: slackChannelId,
            ts,
            text: response,
          });
          currentBatchSize = 0;

          //parse the message property which is a JSON string
          const endData = JSON.parse(data.message)
          const history = endData.history //this is the new chat history array to pass back with the next question
          sqliteManager.updateHistory(slackUserId, slackTeamId, JSON.stringify(history));

          this.close();
        } else if (data.type === 'error') {
          logger.error(prettyJSON(data.message));
          commonService.updateMessage({
            botAccessToken: commonService.getBotAccessToken(),
            sink: slackChannelId,
            ts,
            text: 'An error occurred while fetching the answer. Please try again later.',
          });
          this.close();
        }
      }
    }
    //The API will close the connection when it is done sending the response. If the connection closes before the API is done, it was an error.
    ws.onclose = function (event) {
      if (!event.wasClean) {
        console.warn(event)
        commonService.updateMessage({
          botAccessToken: commonService.getBotAccessToken(),
          sink: slackChannelId,
          ts,
          text: 'An error occurred while fetching the answer. Please try again later.',
        });
      }
    }
  }
}

export default WsService;
