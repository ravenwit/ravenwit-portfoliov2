export type ParamState = {
  R: number;
  tau: number;
  uMin: string;
  uMax: string;
  vMin: string;
  vMax: string;
  f1: string;
  f2: string;
};

export type PresetMap = {
  [key: string]: ParamState;
};
