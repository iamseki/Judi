import fs from 'fs';
import chalk from 'chalk';

import { JudiEvent, JudiEvents } from './models/judi';
import { JudiStateMachine } from './mmi/judi';
import { askInitialState } from './mmi/user';
import { AccountInfo } from './usecases/account-info';
import { Order } from './usecases';
import { Factory } from './factory';

console.log(chalk.bgCyanBright.bold(`NODE_ENV:${process.env.NODE_ENV}`));

const binanceProxy = Factory.Proxy();
const binanceListener = Factory.MarketListener();
const accountInfo = new AccountInfo(binanceProxy);
const order = new Order(binanceProxy);

(async () => {
  const initialState = await askInitialState();

  const judi = new JudiStateMachine(initialState, accountInfo, order, binanceListener);

  judi.on(JudiEvents.Successed, (event: JudiEvent) => {
    const loggingFile = process.env.NODE_ENV === 'DEV' ? 'result-dev.json' : 'result.json';
    fs.appendFileSync(
      loggingFile,
      JSON.stringify(
        {
          date: new Date().toString(),
          ...event,
        },
        null,
        2,
      ),
    );
    console.log(chalk.greenBright(JSON.stringify(event, null, 2)));
  });

  judi.on(JudiEvents.Failed, (event: JudiEvent) => {
    console.log(chalk.redBright(JSON.stringify(event, null, 2)));
  });

  judi.on(JudiEvents.Processing, (event: JudiEvent) => {
    console.log(chalk.blue(JSON.stringify(event, null, 2)));
  });

  await judi.start();
})();
