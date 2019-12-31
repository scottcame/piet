import App from '../components/App.svelte';
import * as pkg from '../../package.json';

export class AppFactory {

  private static readonly INSTANCE = new AppFactory();

  private constructor() {}

  static getInstance(): AppFactory {
    return AppFactory.INSTANCE;
  }

  makeApp(remote: boolean): App {
    console.log(pkg.name + " " + pkg.version);
    return new App({
      target: document.body,
      props: {
        remote: remote
      }
    });
  }

}
