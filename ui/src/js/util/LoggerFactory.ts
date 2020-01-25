// Copyright 2020 National Police Foundation
// Copyright 2020 Scott Came Consulting LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
