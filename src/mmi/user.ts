import prompts from 'prompts';
import { JudiInitialState } from '../models/judi';

export const askInitialState = async (): Promise<JudiInitialState> => {
  const response = await prompts({
    type: 'select',
    name: 'state',
    message: 'Pick a initial state for Judi',
    choices: [
      {
        title: 'Account Ballance',
        description: 'Prints your account balance',
        value: JudiInitialState.ACCOUNT_BALANCE,
      },
      { title: 'Symbol Price', description: 'Prints symbol price', value: JudiInitialState.SYMBOL_PRICE },
      { title: 'Buy', description: 'Buy flow of Judi machine state', value: JudiInitialState.BUY },
      { title: 'Sell', description: 'Sell flow of Judi machine state', value: JudiInitialState.SELL },
      {
        title: 'Operates my money',
        description: 'Judi default flow to operates your money',
        value: JudiInitialState.OPERATE_MY_MONEY,
      },
    ],
    initial: 3,
  });

  return response.state as JudiInitialState;
};
