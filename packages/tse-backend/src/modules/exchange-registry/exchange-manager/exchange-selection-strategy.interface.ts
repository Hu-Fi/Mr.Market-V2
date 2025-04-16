export interface ExchangeSelectionStrategy {
  selectExchange(instance: any): Promise<any>;
}
