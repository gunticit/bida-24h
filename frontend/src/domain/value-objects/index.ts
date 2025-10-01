// Domain Value Objects
export class Email {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new Error(`Invalid email format: ${this.value}`);
    }
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string = 'VND'
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new Error(`Money amount cannot be negative: ${this.amount}`);
    }
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(multiplier: number): Money {
    return new Money(this.amount * multiplier, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare different currencies');
    }
    return this.amount > other.amount;
  }

  toString(): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }
}

export class TimeRange {
  constructor(
    private readonly startTime: Date,
    private readonly endTime?: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.endTime && this.startTime >= this.endTime) {
      throw new Error('Start time must be before end time');
    }
  }

  getStartTime(): Date {
    return this.startTime;
  }

  getEndTime(): Date | undefined {
    return this.endTime;
  }

  getDurationInMinutes(): number | null {
    if (!this.endTime) {
      return null;
    }
    return Math.floor((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
  }

  getDurationInHours(): number | null {
    const minutes = this.getDurationInMinutes();
    return minutes ? minutes / 60 : null;
  }

  withEndTime(endTime: Date): TimeRange {
    return new TimeRange(this.startTime, endTime);
  }

  isActive(): boolean {
    return this.endTime === undefined;
  }

  equals(other: TimeRange): boolean {
    return this.startTime.getTime() === other.startTime.getTime() 
      && this.endTime?.getTime() === other.endTime?.getTime();
  }
}