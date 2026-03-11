import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, PrimaryColumn, JoinColumn, ManyToOne, Index } from 'typeorm';
import { Candidate } from './candidate.entity';

@Entity('candidate_documents')
export class CandidateDocument {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Index()
  @Column({ name: 'candidate_id',type: "text"})
  candidateId!: string;

   @Column({ name: 'document_type',type: "text"})
  documentType!: string; // e.g., 'resume', 'cover_letter'


  @Column({ name: 'file_name',type: "text"})
  fileName!: string;

  @Column({ name: 'storage_key',type: "text" })
  storageKey!: string;

  @Column({name:'raw_text',type: "text"})
  rawText!: string;

 @CreateDateColumn({ name: 'uploaded_at', type: 'timestamptz' })
  uploadedAt!: Date;

  @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Candidate;
}