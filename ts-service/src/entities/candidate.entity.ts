import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { Workspace } from './workspace.entity';

@Entity({ name: 'candidates' })
export class Candidate {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id!: string;

  @Column({ name: 'workspace_id', type: 'varchar', length: 64 })
  workspaceId!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 160 })
  fullName!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  email!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.candidates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace!: Workspace;

  /* @OneToMany(() => CandidateDocument, (doc) => doc.candidate)
  documents: CandidateDocument[];

  @OneToMany(() => CandidateSummary, (summary) => summary.candidate)
  summaries: CandidateSummary[]; */
  
}
