import { DiscordBot } from './discord.bot';
const feathers = require('@feathers/feathers');
const express = require('@feathers/express');

class RestServer {
  public port: 3030;
  private rest: any;

  constructor(private config: Object) {
    this.rest = express(feathers());
    this.rest.use(express.json());
    this.rest.use(express.urlencoded({ extended: true }));
    this.rest.configure(express.rest());
    this.rest.use(express.errorHandler());
  }

  public init(discord: DiscordBot) {
    this.rest.use('/game-prep/discord', this.discordGamePrep(discord));
    return this.listen(this.port);
  }

  /**
   * Discord Game Prep is the REST service methods for
   * controlling who is active in a game.
   * @method
   * @param discord {DiscordBot}
   * @return {Object}
   */
  private discordGamePrep(discord: DiscordBot): Object {
    return {
      // create: add role to player and move into specific room.
      async create(data, params) {

      },
      // remove: remove role from player.
      async remove(data, params) {

      },
    };
  }

  private listen(port: number) {
    this.rest.listen(port);
  }
}
