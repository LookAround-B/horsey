import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Pusher service for real-time score updates.
 * In development, logs events instead of dispatching.
 */
@Injectable()
export class PusherService {
  private readonly logger = new Logger(PusherService.name);
  private pusher: any;

  constructor(private configService: ConfigService) {
    const appId = this.configService.get('PUSHER_APP_ID');

    if (appId && appId !== '...') {
      const Pusher = require('pusher');
      this.pusher = new Pusher({
        appId,
        key: this.configService.get('PUSHER_KEY'),
        secret: this.configService.get('PUSHER_SECRET'),
        cluster: this.configService.get('PUSHER_CLUSTER', 'ap2'),
        useTLS: true,
      });
    }
  }

  /**
   * Trigger a realtime event.
   * Used for live leaderboard updates during scoring.
   */
  async trigger(channel: string, event: string, data: any) {
    if (this.pusher) {
      await this.pusher.trigger(channel, event, data);
      this.logger.log(`Pusher: ${channel}/${event}`);
    } else {
      this.logger.warn(`[DEV] Pusher event: ${channel}/${event}`);
    }
  }

  /**
   * Emit leaderboard update for a competition.
   */
  async emitLeaderboardUpdate(competitionId: string, leaderboard: any) {
    await this.trigger(
      `competition-${competitionId}`,
      'leaderboard-update',
      leaderboard,
    );
  }

  /**
   * Emit when a new score is submitted.
   */
  async emitScoreSubmitted(competitionId: string, scoreData: any) {
    await this.trigger(
      `competition-${competitionId}`,
      'score-submitted',
      scoreData,
    );
  }
}
