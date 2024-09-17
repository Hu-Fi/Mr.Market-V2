export interface Strategy {
  start(params: any): Promise<void>;
  stop(params: any): Promise<void>;
  pause(params: any): Promise<void>;
}
