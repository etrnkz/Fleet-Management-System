/**
 * TypeORM CLI entry (migrations). Used by: npm run migration:run / migration:generate
 * Loads .env from process cwd (Backend/) when present.
 */
import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { typeOrmOptionsForCli } from './database/typeorm.factory';

config();

export default new DataSource(typeOrmOptionsForCli());
