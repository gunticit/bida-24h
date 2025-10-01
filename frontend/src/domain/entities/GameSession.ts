import { SessionStatus } from '../enums';
import { Money, TimeRange } from '../value-objects';

export class GameSession {
  constructor(
    private readonly id: number,
    private readonly tableId: number,
    private timeRange: TimeRange,
    private hourPrice: Money,
    private totalMoneyTable: Money,
    private totalMoneyFood: Money,
    private status: SessionStatus,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  getId(): number {
    return this.id;
  }

  getTableId(): number {
    return this.tableId;
  }

  getTimeRange(): TimeRange {
    return this.timeRange;
  }

  getHourPrice(): Money {
    return this.hourPrice;
  }

  getTotalMoneyTable(): Money {
    return this.totalMoneyTable;
  }

  getTotalMoneyFood(): Money {
    return this.totalMoneyFood;
  }

  getStatus(): SessionStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getTotalMoney(): Money {
    return this.totalMoneyTable.add(this.totalMoneyFood);
  }

  calculateTableCost(): Money {
    let durationInHours = this.timeRange.getDurationInHours();
    
    if (durationInHours === null) {
      // Session is still active, calculate from start time to now
      const now = new Date();
      const tempTimeRange = this.timeRange.withEndTime(now);
      durationInHours = tempTimeRange.getDurationInHours();
    }

    return this.hourPrice.multiply(durationInHours || 0);
  }

  endSession(endTime: Date): void {
    if (!this.isPlaying()) {
      throw new Error('Cannot end session that is not playing');
    }

    this.timeRange = this.timeRange.withEndTime(endTime);
    this.totalMoneyTable = this.calculateTableCost();
    this.status = SessionStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  addFoodCost(amount: Money): void {
    if (!this.isPlaying()) {
      throw new Error('Cannot add food cost to completed session');
    }

    this.totalMoneyFood = this.totalMoneyFood.add(amount);
    this.updatedAt = new Date();
  }

  cancelSession(): void {
    if (this.isCompleted()) {
      throw new Error('Cannot cancel completed session');
    }

    this.status = SessionStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  isPlaying(): boolean {
    return this.status === SessionStatus.PLAYING;
  }

  isCompleted(): boolean {
    return this.status === SessionStatus.COMPLETED;
  }

  isCancelled(): boolean {
    return this.status === SessionStatus.CANCELLED;
  }

  isActive(): boolean {
    return this.isPlaying();
  }

  getDurationInMinutes(): number | null {
    return this.timeRange.getDurationInMinutes();
  }

  getDurationInHours(): number | null {
    return this.timeRange.getDurationInHours();
  }
}