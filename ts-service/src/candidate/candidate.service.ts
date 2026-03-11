import { randomUUID } from 'crypto';

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthUser } from '../auth/auth.types';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CandidateDocument } from 'src/entities/candidate-document.entity';
import { CandidateSummary } from 'src/entities/candidate_summmary.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Workspace } from 'src/entities/workspace.entity';
import { Candidate } from 'src/entities/candidate.entity';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(CandidateDocument)
    private readonly documentRepository: Repository<CandidateDocument>,
    @InjectRepository(CandidateSummary)
    private readonly summaryRepository: Repository<CandidateSummary>,
  ) { }

  async createCandidate(user: AuthUser, dto: CreateCandidateDto): Promise<Candidate> {
    await this.ensureWorkspace(user.workspaceId);

    const candidate = this.candidateRepository.create({
      id: randomUUID(),
      workspaceId: user.workspaceId,
      fullName: dto.fullName.trim(),
      email: dto.email?.trim() ?? null,
    });

    return this.candidateRepository.save(candidate);
  }

  async listCandidates(user: AuthUser): Promise<Candidate[]> {
    return this.candidateRepository.find({
      where: { workspaceId: user.workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  private async ensureWorkspace(workspaceId: string): Promise<void> {
    const existing = await this.workspaceRepository.findOne({ where: { id: workspaceId } });

    if (existing) {
      return;
    }

    const workspace = this.workspaceRepository.create({
      id: workspaceId,
      name: `Workspace ${workspaceId}`,
    });

    await this.workspaceRepository.save(workspace);
  }

  // Helper to ensure the candidate belongs to the recruiter's workspace
  private async validateCandidateAccess(user: AuthUser, candidateId: string) {
    
    const candidate = await this.candidateRepository.findOne({ where: { id: candidateId } });
    if (!candidate) throw new NotFoundException('Candidate not found');
    if (candidate.workspaceId !== user.workspaceId) {
      throw new ForbiddenException('You do not have access to this candidate');
    }
    return candidate;
  }

  async saveDocument(user: AuthUser, candidateId: string, dto: CreateDocumentDto) {
    await this.validateCandidateAccess(user, candidateId);

    const generatedKey = `storage/${Date.now()}-${dto.fileName}`;

    const doc = this.documentRepository.create({
      candidateId,
      documentType: dto.documentType,
      fileName: dto.fileName,
      storageKey:generatedKey,
      rawText: dto.rawText,
    });
    return this.documentRepository.save(doc);
  }
  async createPendingSummary(user: AuthUser, candidateId: string) {
    await this.validateCandidateAccess(user, candidateId);

    const summary = this.summaryRepository.create({
      candidateId,
      status: 'pending',
    });
    return this.summaryRepository.save(summary);
  }

  async listSummaries(user: AuthUser, candidateId: string) {
    await this.validateCandidateAccess(user, candidateId);
    return this.summaryRepository.find({ where: { candidateId } });
  }

  async getSummary(user: AuthUser, summaryId: string) {
    const summary = await this.summaryRepository.findOne({ where: { id: summaryId } });
    if (!summary) throw new NotFoundException('Summary not found');

    // Check if the parent candidate belongs to the user's workspace
    await this.validateCandidateAccess(user, summary.candidateId);
    return summary;
  }
}

