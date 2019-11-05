import { sep } from 'path';

export class Logger {

  private static instance: Logger;
  private pathRegex: RegExp;
  private constructor() {
    this.pathRegex = new RegExp(".+" + sep + "(.+)\\)")
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  getLogMessage(message: string): string {
    return "[" +
      this.getSourceLocation() +
      "] " + message;
  }

  log(message: string): void {
    console.log(this.getLogMessage(message));
  }

  private getSourceLocation(): string {
    let ret = new Error().stack.split('\n')[3];
    ret = ret.replace(this.pathRegex, "$1");
    return ret;
  }

}
