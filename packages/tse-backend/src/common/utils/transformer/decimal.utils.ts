import { ValueTransformer } from 'typeorm';
import { Decimal } from 'decimal.js';

export class DecimalTransformer implements ValueTransformer {
  to(value: Decimal | null): string | null {
    if (value === null) return null;
    return value.toString();
  }

  from(value: string | null): Decimal | null {
    if (value === null) return null;
    return new Decimal(value);
  }
}
