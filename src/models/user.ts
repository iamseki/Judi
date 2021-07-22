import { JudiInitialState } from './judi';

export interface UserQuestionsResponse {
  initialState: JudiInitialState;
  symbol?: string;
  goodBuy?: number;
  goodSell?: number;
}
