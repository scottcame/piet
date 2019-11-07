import { sep } from 'path';

export class Logger {

  private static instance: Logger;
  private pathRegex: RegExp;
  private constructor() {
    this.pathRegex = new RegExp(".+" + sep + "(.+)\\)");
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  getLogMessage(message: string, stackDepth=0): string {
    return "[" +
      this.getSourceLocation(3+stackDepth) +
      "] " + message;
  }

  log(message: string): void {
    /* eslint-disable no-undef, no-console */
    console.log(this.getLogMessage(message), 1);
  }

  private getSourceLocation(stackDepth: number): string {
    let ret = new Error().stack.split('\n')[stackDepth];
    ret = ret.replace(this.pathRegex, "$1");
    return ret;
  }

}
