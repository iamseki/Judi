import prompts from 'prompts';
import { JudiInitialState } from '../models/judi';

export const askInitialState = async (): Promise<JudiInitialState> => {
  const response = await prompts({
    type: 'select',
    name: 'state',
    message: 'Pick a initial state for Judi',
    choices: [
      { title: 'Account Ballance', description: 'Prints your account balance', value: JudiInitialState.AccountBalance },
      { title: 'Symbol Price', description: 'Prints symbol price', value: JudiInitialState.SymbolPrice },
      { title: 'Buy', description: 'Buy flow of Judi machine state', value: JudiInitialState.Buy },
      { title: 'Sell', description: 'Sell flow of Judi machine state', value: JudiInitialState.Sell },
      {
        title: 'Operates my money',
        description: 'Judi default flow to operates your money',
        value: JudiInitialState.OperateMyMoney,
      },
    ],
    initial: 3,
  });

  return response.state as JudiInitialState;
};
