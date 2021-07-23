import fs from 'fs';
import chalk from 'chalk';

import { JudiEvent, JudiEvents } from './models/judi';
import { JudiStateMachine } from './mmi/judi';
import { askInitialState } from './mmi/user';
import { AccountInfo } from './usecases/account-info';
import { Market, Order } from './usecases';
import { Factory } from './factory';

console.log(chalk.bgCyanBright.bold(`NODE_ENV:${process.env.NODE_ENV}`));

const binanceProxy = Factory.Proxy();
const binanceListener = Factory.MarketListener();

const accountInfo = new AccountInfo(binanceProxy);
const order = new Order(binanceProxy);
const market = new Market(binanceProxy);

let processing = false;

const run = async () => {
  processing = true;
  const { initialState, ...config } = await askInitialState();

  const judi = new JudiStateMachine(initialState, accountInfo, order, market, binanceListener, config);

  judi.on(JudiEvents.SUCCESS, (event: JudiEvent) => {
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

  judi.on(JudiEvents.FAILURE, (event: JudiEvent) => {
    console.log(chalk.redBright(JSON.stringify(event, null, 2)));
  });

  judi.on(JudiEvents.PROCESSING, (event: JudiEvent) => {
    console.log(chalk.blue(JSON.stringify(event, null, 2)));
  });

  judi.on(JudiEvents.PROCESS_END, () => (processing = false));

  await judi.start();
};

setInterval(async () => {
  if (!processing) {
    await run();
  }
}, 200);
