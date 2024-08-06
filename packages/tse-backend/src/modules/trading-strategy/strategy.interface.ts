export interface Strategy {
  start(params: any): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
}
