import App from './App.svelte';
import * as pkg from '../package.json';

console.log(pkg.name + " " + pkg.version);

const app = new App({
  target: document.body
});

export default app;
