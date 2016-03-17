import {Stages, changeStage} from "../../services/firebase.service";

export default function (bot) {
  bot.addCommand('@firebase', function(o) {
    changeStage(Stages.objective);
  });
}

