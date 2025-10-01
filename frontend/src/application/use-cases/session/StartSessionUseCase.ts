import { SessionRepositoryInterface, TableRepositoryInterface } from '../../ports/repositories';
import { StartSessionDTO } from '../../dto';
import { GameSession } from '../../../domain/entities';

export class StartSessionUseCase {
  constructor(
    private sessionRepository: SessionRepositoryInterface,
    private tableRepository: TableRepositoryInterface
  ) {}

  async execute(data: StartSessionDTO): Promise<GameSession> {
    // Validate input
    if (!data.tableId || !data.hourPrice) {
      throw new Error('Table ID and hour price are required');
    }

    if (data.hourPrice <= 0) {
      throw new Error('Hour price must be greater than 0');
    }

    // Check if table exists and is available
    const table = await this.tableRepository.findById(data.tableId);
    if (!table) {
      throw new Error('Table not found');
    }

    if (!table.canStartSession()) {
      throw new Error('Table is not available for starting a session');
    }

    // Check if table already has an active session
    const activeSession = await this.sessionRepository.findActiveSessionByTableId(data.tableId);
    if (activeSession) {
      throw new Error('Table already has an active session');
    }

    try {
      return await this.sessionRepository.startSession(data);
    } catch (error) {
      throw new Error('Failed to start session');
    }
  }
}