import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SUMMARIZATION_PROVIDER, SummarizationProvider } from '../llm/summarization-provider.interface';
import { CandidateSummary } from 'src/entities/candidate_summmary.entity';
import { CandidateDocument } from 'src/entities/candidate-document.entity';
import { QueueService } from 'src/queue/queue.service';

@Injectable()
export class WorkerService {
    private readonly logger = new Logger(WorkerService.name);

    constructor(
        @Inject(SUMMARIZATION_PROVIDER)
        private readonly provider: SummarizationProvider,
        @InjectRepository(CandidateSummary)
        private readonly summaryRepo: Repository<CandidateSummary>,
        @InjectRepository(CandidateDocument)
        private readonly docRepo: Repository<CandidateDocument>,
        private readonly queueService: QueueService,
    ) { }
    async processQueueJob(jobId: string) {
        // Find the job in the starter's QueueService
        const job = this.queueService.getQueuedJobs().find(j => j.id === jobId);
        if (!job || job.name !== 'generate-summary') return;

        const { summaryId, candidateId } = job.payload as any;
        this.logger.log(`Worker: Processing Job ${jobId} for Candidate ${candidateId}`);

        try {
            const docs = await this.docRepo.find({ where: { candidateId } });
            const texts = docs.map(d => d.rawText);
            // Status Transition: Completed
            const result = await this.provider.generateCandidateSummary({ candidateId, documents: texts });

            await this.summaryRepo.update(summaryId, {
                ...result,
                status: 'completed',
                provider: 'gemini-3-flash',
                promptVersion: 'v1.0',
                updatedAt: new Date(),
            });

            this.logger.log(`Worker: Job ${jobId} completed successfully.`);
        } catch (e: any) {
            this.logger.error(`Worker: Job ${jobId} failed - ${e.message}`);
            await this.summaryRepo.update(summaryId, {
                status: 'failed',
                errorMessage: e.message,
                updatedAt: new Date(),
            });
        }
    }


}