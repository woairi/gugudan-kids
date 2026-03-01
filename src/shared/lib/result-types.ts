export type WrongItem = {
  dan: number;
  right: number;
  answer: number;
  picked: number;
};

export type LastResult = {
  id: string;
  at: string;
  dan: number;
  total: number;
  correct: number;
  msTotal: number;
  perQuestionMsAvg: number;
  wrongItems: WrongItem[];
};
