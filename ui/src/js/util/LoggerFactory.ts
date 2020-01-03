export enum LogLevel {
  NONE,
  ALWAYS,
  ERROR,
  WARN,
  INFO,
  DEBUG
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class LoggerFactory {

  // no doubt there is a better way to do this, but...
  private static levelStrings = ['none','always','error','warn','info','debug'];
  private static levels = [LogLevel.NONE, LogLevel.ALWAYS, LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
  
  level: LogLevel;

  constructor(level: LogLevel) {
    this.level = level;
  }

  private getLogger(level: LogLevel): (arg: any) => void {
    if (level <= this.level) {
      // eslint-disable-next-line no-console
      return console.log;
    }
    return (_arg: any): void => {};
  }

  // there is no log function property for level "none" because, well, we never log at that level. it's a "special" level
  //  to set as the level for the logger to indicate that we never actually print the log...

  get always(): (arg: any) => void {
    return this.getLogger(LogLevel.ALWAYS);
  }

  get error(): (arg: any) => void {
    return this.getLogger(LogLevel.ERROR);
  }

  get warn(): (arg: any) => void {
    return this.getLogger(LogLevel.WARN);
  }

  get info(): (arg: any) => void {
    return this.getLogger(LogLevel.INFO);
  }

  get debug(): (arg: any) => void {
    return this.getLogger(LogLevel.DEBUG);
  }

  static getLevelForString(s: string): LogLevel {
    const idx = LoggerFactory.levelStrings.indexOf(s);
    return idx === -1 ? LogLevel.NONE : LoggerFactory.levels[idx];
  }

  static getLabelForLevel(level: LogLevel): string {
    const idx = LoggerFactory.levels.indexOf(level);
    return idx === -1 ? null : LoggerFactory.levelStrings[idx];
  }

}
