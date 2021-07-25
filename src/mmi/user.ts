import prompts from 'prompts';
import { UserQuestionsResponse } from '../models/user';
import { FactoryUserQuestions } from './questions';

export const askInitialState = async (): Promise<UserQuestionsResponse> => {
  const response = await prompts(FactoryUserQuestions.defaultFlow());
  return response as UserQuestionsResponse;
};
