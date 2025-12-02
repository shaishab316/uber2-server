/* eslint-disable no-unused-vars */
import { Server as HTTPServer } from 'http';

export type TCleanupFunction = () => void;

export type TServer = HTTPServer & {
  addPlugins: (...plugins: TCleanupFunction[]) => void;
};
