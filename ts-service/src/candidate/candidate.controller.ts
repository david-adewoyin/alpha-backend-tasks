import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/auth-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { FakeAuthGuard } from '../auth/fake-auth.guard';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CandidateService } from './candidate.service';
import { QueueService } from 'src/queue/queue.service';
import { WorkerService } from './worker.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@Controller('candidates')
@UseGuards(FakeAuthGuard)
export class CandidateController {
  constructor(private readonly candidateService: CandidateService,
    private readonly queueService: QueueService,
    private readonly workerService: WorkerService,
  ) { }

  @Post('/')
  async createCandidate(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCandidateDto,
  ) {
    return this.candidateService.createCandidate(user, dto);
  }

  @Get('/')
  async listCandidates(@CurrentUser() user: AuthUser) {
    return this.candidateService.listCandidates(user);
  }

  @Post('/:candidateId/documents')
  async upload(
    @CurrentUser() user: AuthUser,
    @Param('candidateId') candidateId: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.candidateService.saveDocument(user, candidateId, dto);
  }

  @Post('/:candidateId/summaries/generate')
  @HttpCode(HttpStatus.ACCEPTED)
  async generate(
    @CurrentUser() user: AuthUser,
    @Param('candidateId') candidateId: string
  ) {
    // 1. Prepare the DB record
    const summary = await this.candidateService.createPendingSummary(user, candidateId);

    // 2. ENQUEUE using the starter's pattern
    const job = this.queueService.enqueue('generate-summary', { 
      summaryId: summary.id, 
      candidateId: candidateId 
    });

    // 3. Trigger the Worker to process the job we just enqueued
    this.workerService.processQueueJob(job.id);

    return { 
      jobId: job.id, 
      summaryId: summary.id, 
      status: 'pending',
      enqueuedAt: job.enqueuedAt 
    };
  }

  @Get('/:candidateId/summaries')
  async list(
    @CurrentUser() user: AuthUser,
    @Param('candidateId') cid: string) {
    return this.candidateService.listSummaries(user, cid);
  }

  @Get('/:candidateId/summaries/:summaryId')
  async getOne(
    @CurrentUser() user: AuthUser,
    @Param('summaryId') sid: string,
  ) {
    return this.candidateService.getSummary(user, sid);
  }
}
