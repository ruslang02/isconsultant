let counter = 0;
export const generateId = () =>
    (Math.floor((new Date().getTime() - new Date(2020, 0).getTime()) / 1000) <<
    4) +
  (counter++ % 16);
