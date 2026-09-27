import { PresetMap } from './types';

export const PRESETS: PresetMap = {
  'Torus': {
    R: 3,
    tau: 0,
    uMin: '0', uMax: '2*pi',
    vMin: '0', vMax: '2*pi',
    f1: 'cos(v)',
    f2: 'sin(v)'
  },
  'Möbius Strip': {
    R: 3,
    tau: 0.5,
    uMin: '0', uMax: '2*pi',
    vMin: '-1', vMax: '1',
    f1: 'v',
    f2: '0'
  },
  'Cylinder': {
    R: 3,
    tau: 0,
    uMin: '0', uMax: '2*pi',
    vMin: '-1', vMax: '1',
    f1: '0',
    f2: 'v'
  },
  'Klein Bottle (Figure-8)': {
    R: 3,
    tau: 0.5,
    uMin: '0', uMax: '2*pi',
    vMin: '0', vMax: '2*pi',
    f1: 'cos(v)',
    f2: 'sin(v) * cos(v)'
  },
  'Twisted Ribbon': {
    R: 3,
    tau: 3,
    uMin: '0', uMax: '2*pi',
    vMin: '-1', vMax: '1',
    f1: 'v',
    f2: '0'
  },
  'Corrugated Tube': {
    R: 3,
    tau: 0,
    uMin: '0', uMax: '2*pi',
    vMin: '0', vMax: '2*pi',
    f1: '1 + 0.2*cos(10*v)',
    f2: 'sin(v)'
  }
};
