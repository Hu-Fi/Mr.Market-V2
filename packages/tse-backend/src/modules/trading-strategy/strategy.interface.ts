export interface Strategy {
  start(params: any): Promise<NodeJS.Timeout>;
  stop(intervalId: NodeJS.Timeout): Promise<void>;
  pause(intervalId: NodeJS.Timeout): Promise<void>;
}
