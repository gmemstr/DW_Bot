export class TwitchBot {

  constructor(private config: {[key: string]: any}) {
    console.log(this.greet());
  }

  public greet() {
    return console.log(this.config);
  }
}
