export interface Logger {
  debug(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  error(message: string, ...meta: unknown[]): void;
}

export class ConsoleLogger implements Logger {
  private prefix: string;

  constructor(prefix = '[DevPublisher]') {
    this.prefix = prefix;
  }

  debug(message: string, ...meta: unknown[]): void {
    if (process.env.DEBUG) {
      console.debug(`${this.prefix} [DEBUG] ${message}`, ...meta);
    }
  }

  info(message: string, ...meta: unknown[]): void {
    console.info(`${this.prefix} ${message}`, ...meta);
  }

  warn(message: string, ...meta: unknown[]): void {
    console.warn(`${this.prefix} ⚠️ ${message}`, ...meta);
  }

  error(message: string, ...meta: unknown[]): void {
    console.error(`${this.prefix} ❌ ${message}`, ...meta);
  }
}

export class SilentLogger implements Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}

export class GitHubActionLogger implements Logger {
  debug(message: string): void {
    console.log(`::debug::${message}`);
  }

  info(message: string): void {
    console.log(message);
  }

  warn(message: string): void {
    console.log(`::warning::${message}`);
  }

  error(message: string): void {
    console.log(`::error::${message}`);
  }
}
