import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Candidate } from '../entities/candidate.entity';
import { Workspace } from '../entities/workspace.entity';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { QueueModule } from 'src/queue/queue.module';
import { CandidateDocument } from 'src/entities/candidate-document.entity';
import { CandidateSummary } from 'src/entities/candidate_summmary.entity';
import { WorkerService } from './worker.service';
import { SUMMARIZATION_PROVIDER } from 'src/llm/summarization-provider.interface';
import { GeminiSummarizationProvider } from 'src/llm/gemini_summarization.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, Candidate,CandidateDocument, CandidateSummary],),QueueModule,],
  controllers: [CandidateController],
  providers: [CandidateService,WorkerService,
      {
      provide: SUMMARIZATION_PROVIDER,
      useClass: GeminiSummarizationProvider,
    },
  ],
  exports: [CandidateService],
})
export class CandidateModule {}
