import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Candidate } from './candidate.entity';

@Entity({ name: 'candidate_summaries' })
export class CandidateSummary {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id!: string;

    @Index()
    @Column({ name: 'candidate_id', type: "text" })
    candidateId!: string;

    @Column({
        type: 'varchar',
        default: 'pending',
    })
    status!: 'pending' | 'completed' | 'failed';

    @Column({ type: 'int', nullable: true })
    score!: number | null;

    @Column({ type: 'simple-array', nullable: true })
    strengths!: string[] | null;

    @Column({ type: 'simple-array', nullable: true })
    concerns!: string[] | null;

    @Column({ type: 'text', nullable: true })
    summary!: string | null;

    @Column({ name: 'recommended_decision', type:"text",nullable: true })
    recommendedDecision!: string | null;

    @Column({ nullable: true,type:"text" })
    provider!: string | null;

    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage!: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;

    @Column({ name: 'prompt_version', type: 'text', default: 'v1.0' })
    promptVersion!: string;

    // Relationship: Many summaries belong to one candidate
    @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'candidate_id' })
    candidate!: Candidate;
}