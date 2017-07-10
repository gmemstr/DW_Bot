export interface IRank {
  id?: number;
  level?: number;
  rankLevel?: number;
  rank?: string;
  levelName?: string;
  xpRequired?: number;
}

export interface IWarrior {
  id: number;
  favFood?: string;
  c9Name?: string;
  htmlRate?: number;
  jsRate?: number;
  cssRate?: number;
  updatedAt?: string;
}

export interface IInventory {
  id?: any;
  [itemName: string]: number;
}

export interface IAccount {
  id?: number;
  rank?: IRank;
  nextRank?: IRank;
  username?: string;
  provider?: string;
  ranking?: {
    id?: number,
    points?: number,
    xp?: number,
    rank?: number,
  };
  role?: 'USER' | 'EDITOR' | 'ADMIN';
  appliedGames?: [number];
  referredUsers?: number;
  avatarURL?: string;
  gamesPlayed?: number;
  gamesWon?: number;
  gamesLost?: number;
  warrior?: IWarrior;
  score?: number;
  veteran?: boolean;
  bettingBitsEarned?: number;
  inventory?: IInventory;
}

export interface IPlayer {
  id?: number;
  user?: IAccount;
  language?: 'HTML' | 'CSS' | 'JS';
  pointsChanged?: number;
  xpChanged?: number;
}

export interface ITeam {
  name?: string;
  id?: number;
  embedLink?: any;
  endGame?: any;
  win?: boolean;
  codeUrl?: string;
  websiteUrl?: string;
  userTeam?: string;
  players?: [IPlayer];
  completedObjectives?: [any]; // TODO: this should not be any.
  designVotes?: number;
  funcVotes?: number;
  codeVotes?: number;
}

export interface IObjective {
  id?: number;
  orderID?: number;
  objectiveText?: string;
}

export interface IGame {
  id?: number;
  timestamp?: number;
  theme?: string;
  status?: any;
  active?: boolean;
  done?: boolean;
  teamGame?: boolean;
  youtubeURL?: string;
  teams?: { [teamName: string]: ITeam };
  objectives?: [IObjective];
  season?: number;
  hasTournament?: boolean;
}
