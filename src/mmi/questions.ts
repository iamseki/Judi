import { PromptObject } from 'prompts';
import { JudiInitialState } from '../models/judi';

export class FactoryUserQuestions {
  static defaultFlow(): PromptObject[] {
    const isFlowActive = !!process.env.JUDI_PROMPT_FLOW;

    const initialQuestion: PromptObject = {
      type: 'select',
      name: 'initialState',
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
    };

    const secondQuestion: PromptObject = {
      type: (prev) => (prev !== JudiInitialState.ACCOUNT_BALANCE ? 'text' : null),
      name: 'symbol',
      message: `What symbol you wanna trade ?`,
    };

    const thirdQuestionIfInitialStateIsBuy: PromptObject = {
      type: (prev, answers) =>
        prev && answers.symbol && answers.initialState === JudiInitialState.BUY ? 'number' : null,
      float: true,
      round: 6,
      name: 'goodBuy',
      message: `What's a good buy value ?`,
    };

    const thirdQuestionIfInitialStateIsSell: PromptObject = {
      type: (prev, answers) =>
        prev && answers.symbol && answers.initialState === JudiInitialState.SELL ? 'number' : null,
      float: true,
      round: 6,
      name: 'goodSell',
      message: `What's a good sell value ?`,
    };

    const fourthQuestionIfSell: PromptObject = {
      type: (prev, answers) => (prev && answers.goodSell ? 'number' : null),
      float: true,
      round: 6,
      name: 'sellQty',
      message: `How much of symbol do you want to sell ?`,
    };

    // if flow is not active return just the first question
    return isFlowActive
      ? [
          initialQuestion,
          secondQuestion,
          thirdQuestionIfInitialStateIsBuy,
          thirdQuestionIfInitialStateIsSell,
          fourthQuestionIfSell,
        ]
      : [initialQuestion];
  }
}
