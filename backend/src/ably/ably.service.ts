import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as Ably from 'ably'; // Import as a namespace
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AblyService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AblyService.name);
  private client: Ably.Realtime | null = null; // Use Ably.Realtime

  constructor(private configService: ConfigService) {}

  onModuleInit(): void {
    const apiKey = this.configService.get<string>('ABLY_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'ABLY_API_KEY not found. AblyService will not be initialized. Please set ABLY_API_KEY in your environment variables.',
      );
      return;
    }

    try {
      this.client = new Ably.Realtime({
        key: apiKey,
        // log: { level: 4 } // for verbose debugging
      });

      this.client.connection.on('connected', () => {
        this.logger.log('Successfully connected to Ably.');
      });

      // The 'failed' event provides a ConnectionStateChange object.
      // The 'reason' property of this object contains the ErrorInfo.
      this.client.connection.on(
        'failed',
        (stateChange: Ably.ConnectionStateChange) => {
          const reason = stateChange.reason;
          if (reason) {
            this.logger.error(
              `Ably connection failed: ${reason.message} (code: ${reason.code}, statusCode: ${reason.statusCode})`,
            );
          } else {
            this.logger.error(
              'Ably connection failed with no specific reason provided.',
            );
          }
        },
      );

      this.client.connection.on('disconnected', () => {
        this.logger.warn('Ably client disconnected.');
      });

      this.client.connection.on('suspended', () => {
        this.logger.warn(
          'Ably connection suspended. Will attempt to reconnect.',
        );
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to initialize Ably client:', message);
      this.client = null;
    }
  }

  // onModuleDestroy should be synchronous as Ably's close() is synchronous
  onModuleDestroy(): void {
    if (this.client) {
      this.logger.log('Closing Ably connection...');
      try {
        this.client.close(); // Ably.Realtime.close() is synchronous
        this.logger.log('Ably connection closed.');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error('Error closing Ably connection:', message);
      }
    }
  }

  async publishMessage(
    channelName: string,
    eventName: string,
    data: any,
  ): Promise<void> {
    if (!this.client) {
      this.logger.error(
        'Ably client is not initialized. Cannot publish message.',
      );
      return;
    }

    if (
      !this.client.connection.state ||
      this.client.connection.state !== 'connected'
    ) {
      this.logger.warn(
        `Ably client not connected (state: ${this.client.connection.state}). Attempting to publish anyway, but it might fail or be queued.`,
      );
    }

    const channel = this.client.channels.get(channelName);
    try {
      console.info(`content publish: ${data}`);
      await channel.publish(eventName, data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to publish message to Ably channel "${channelName}", event "${eventName}": ${message}`,
      );
    }
  }

  getClientStatus(): Ably.ConnectionState | null {
    return this.client ? this.client.connection.state : null;
  }
}
