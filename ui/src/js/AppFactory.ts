import App from '../components/App.svelte';

export class AppFactory {

  private static readonly INSTANCE = new AppFactory();

  private constructor() {}

  static getInstance(): AppFactory {
    return AppFactory.INSTANCE;
  }

  makeApp(remote: boolean): App {
    return new App({
      target: document.body,
      props: {
        remote: remote
      }
    });
  }

}
