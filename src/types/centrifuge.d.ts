declare module 'centrifuge' {
    export class Centrifuge {
      constructor(url: string, options?: any);
  
      on(event: 'connect' | 'disconnect', callback: (context?: any) => void): this;
      connect(): void;
      disconnect(): void;
      newSubscription(channel: string): Subscription;
    }
  
    export class Subscription {
      on(event: 'publication' | 'subscribed', callback: (context?: any) => void): this;
      subscribe(): void;
    }
  }
  