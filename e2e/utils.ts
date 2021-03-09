import { element, by } from 'detox';

export const getByID = (id: string) => element(by.id(id));
