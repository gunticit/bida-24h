import { UserRole } from '../enums';
import { Email } from '../value-objects';

export class User {
  constructor(
    private readonly id: number,
    private name: string,
    private email: Email,
    private role: UserRole,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  getId(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  getRole(): UserRole {
    return this.role;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateName(name: string): void {
    if (!name.trim()) {
      throw new Error('Name cannot be empty');
    }
    this.name = name;
    this.updatedAt = new Date();
  }

  updateEmail(email: Email): void {
    this.email = email;
    this.updatedAt = new Date();
  }

  changeRole(role: UserRole): void {
    this.role = role;
    this.updatedAt = new Date();
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isStaff(): boolean {
    return this.role === UserRole.STAFF;
  }

  isCustomer(): boolean {
    return this.role === UserRole.CUSTOMER;
  }

  hasPermissionToManageTables(): boolean {
    return this.isAdmin() || this.isStaff();
  }

  hasPermissionToViewReports(): boolean {
    return this.isAdmin();
  }
}