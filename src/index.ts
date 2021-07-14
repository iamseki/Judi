import { BinanceProxy } from './proxies';
import { JudiEvent, JudiEvents, JudiInitialState } from './models';
import prompts from 'prompts';
import { JudiStateMachine } from './mmi/judi';
import fs from 'fs';
import chalk from 'chalk';

console.log(chalk.bgCyanBright.bold(`NODE_ENV:${process.env.NODE_ENV}`));

const apiKey = process.env.NODE_ENV === 'DEV' ? process.env.DEV_API_KEY : process.env.PROD_API_KEY;
const apiSecret = process.env.NODE_ENV === 'DEV' ? process.env.DEV_SECRET_KEY : process.env.PROD_SECRET_KEY;
const apiUrl = process.env.NODE_ENV === 'DEV' ? `${process.env.DEV_API_URL}` : `${process.env.PROD_API_URL}`;

const binanceProxy = new BinanceProxy(apiKey, apiSecret, apiUrl);

(async () => {
  const response = await prompts({
    type: 'select',
    name: 'state',
    message: 'Pick a initial state for Judi',
    choices: [
      { title: 'Account Ballance', description: 'Prints your account balance', value: JudiInitialState.AccountBalance },
      { title: 'Buy', description: 'Buy flow of Judi machine state', value: JudiInitialState.Buy },
      { title: 'Sell', description: 'Sell flow of Judi machine state', value: JudiInitialState.Sell },
      {
        title: 'Operates my money',
        description: 'Judi default flow to operates your money',
        value: JudiInitialState.Judi,
      },
    ],
    initial: 3,
  });

  const judi = new JudiStateMachine(response.state, binanceProxy);

  judi.on(JudiEvents.Successed, (event: JudiEvent) => {
    fs.appendFileSync(
      'result.json',
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
