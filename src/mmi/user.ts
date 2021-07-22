import prompts from 'prompts';
import { UserQuestionsResponse } from '../models/user';
import { questions } from './questions';

export const askInitialState = async (): Promise<UserQuestionsResponse> => {
  const response = await prompts(questions);
  return response as UserQuestionsResponse;
};
