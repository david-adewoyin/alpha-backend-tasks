import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

import { Candidate } from '../entities/candidate.entity';
import { Workspace } from '../entities/workspace.entity';
import { CandidateDocument } from '../entities/candidate-document.entity';
import { CandidateSummary } from '../entities/candidate_summmary.entity';

export const defaultDatabaseUrl =
  'postgres://assessment_user:assessment_pass@localhost:5432/assessment_db';

export const getTypeOrmOptions = (
  databaseUrl: string,
): TypeOrmModuleOptions & DataSourceOptions => ({
  type: 'postgres',
  url: databaseUrl,
  entities: [Workspace, Candidate, CandidateDocument, CandidateSummary],
  migrations: [__dirname + '/../migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: false,
});
