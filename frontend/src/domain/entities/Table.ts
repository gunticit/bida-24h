import { TableStatus } from '../enums';
import { Money } from '../value-objects';

export class Table {
  constructor(
    private readonly id: number,
    private name: string,
    private status: TableStatus,
    private pricePerHour: Money,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  getId(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getStatus(): TableStatus {
    return this.status;
  }

  getPricePerHour(): Money {
    return this.pricePerHour;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateName(name: string): void {
    if (!name.trim()) {
      throw new Error('Table name cannot be empty');
    }
    this.name = name;
    this.updatedAt = new Date();
  }

  updatePricePerHour(pricePerHour: Money): void {
    this.pricePerHour = pricePerHour;
    this.updatedAt = new Date();
  }

  startSession(): void {
    if (!this.isAvailable()) {
      throw new Error('Cannot start session on table that is not available');
    }
    this.status = TableStatus.PLAYING;
    this.updatedAt = new Date();
  }

  endSession(): void {
    if (!this.isPlaying()) {
      throw new Error('Cannot end session on table that is not playing');
    }
    this.status = TableStatus.AVAILABLE;
    this.updatedAt = new Date();
  }

  setMaintenance(): void {
    if (this.isPlaying()) {
      throw new Error('Cannot set maintenance on table that is currently playing');
    }
    this.status = TableStatus.MAINTENANCE;
    this.updatedAt = new Date();
  }

  setAvailable(): void {
    this.status = TableStatus.AVAILABLE;
    this.updatedAt = new Date();
  }

  isAvailable(): boolean {
    return this.status === TableStatus.AVAILABLE;
  }

  isPlaying(): boolean {
    return this.status === TableStatus.PLAYING;
  }

  isInMaintenance(): boolean {
    return this.status === TableStatus.MAINTENANCE;
  }

  canStartSession(): boolean {
    return this.isAvailable();
  }
}