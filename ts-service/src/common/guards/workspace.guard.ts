import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Candidate } from '../../entities/candidate.entity';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; //
    const candidateId = request.params.candidateId;

    if (!candidateId) return true;

    const candidate = await this.dataSource.getRepository(Candidate).findOne({
      where: { id: candidateId },
    });

    if (!candidate || candidate.workspaceId !== user.workspaceId) {
      throw new ForbiddenException('You do not have access to this candidate.');
    }

    return true;
  }
}