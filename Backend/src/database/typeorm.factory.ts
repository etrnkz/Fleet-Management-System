import { join } from 'node:path';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { ConfigService } from '@nestjs/config';
import type { DataSourceOptions } from 'typeorm';
import { envString, envStringOptional } from '../config/env.util';

const entityGlob = (base: string) => join(base, '**', '*.entity{.ts,.js}');
const migrationGlob = (base: string) => join(base, 'migrations', '*{.ts,.js}');

/**
 * SQLite is opt-in only (`DB_TYPE=sqlite` or `USE_SQLITE=true`).
 * Default database is PostgreSQL (host/DB_* or DATABASE_URL).
 */
function useSqlite(): boolean {
  const t = (process.env.DB_TYPE || '').trim().toLowerCase();
  if (t === 'sqlite') return true;
  if ((process.env.USE_SQLITE || '').trim().toLowerCase() === 'true')
    return true;
  return false;
}

/**
 * DB_SYNCHRONIZE=true|false overrides everything.
 * Else: SQLite always syncs; Postgres syncs in non-production (dev convenience), off in production.
 */
function synchronizeDefault(): boolean {
  if (process.env.DB_SYNCHRONIZE === 'true') return true;
  if (process.env.DB_SYNCHRONIZE === 'false') return false;
  if (useSqlite()) return true;
  return (process.env.NODE_ENV || 'development') !== 'production';
}

function srcOrDistRoot(): string {
  return join(__dirname, '..');
}

export function typeOrmOptionsForNest(config: ConfigService): TypeOrmModuleOptions {
  const root = srcOrDistRoot();
  const synchronize = synchronizeDefault();
  const logging =
    config.get<boolean | string>('database.logging') === true ||
    process.env.DB_LOGGING === 'true';
  const migrationsRun = process.env.DB_RUN_MIGRATIONS === 'true';

  if (useSqlite()) {
    return {
      type: 'sqlite',
      database: envString('SQLITE_PATH', 'fleet_management.db'),
      entities: [entityGlob(root)],
      migrations: [migrationGlob(root)],
      synchronize,
      logging,
      migrationsRun,
    };
  }

  const common = {
    type: 'postgres' as const,
    entities: [entityGlob(root)],
    migrations: [migrationGlob(root)],
    synchronize,
    logging,
    migrationsRun,
  };

  const nestDatabaseUrl = envStringOptional('DATABASE_URL');
  if (nestDatabaseUrl) {
    return {
      ...common,
      url: nestDatabaseUrl,
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              rejectUnauthorized:
                process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
            }
          : false,
    };
  }

  return {
    ...common,
    host: config.get<string>('database.host', 'localhost'),
    port: config.get<number>('database.port', 5432),
    username: config.get<string>('database.username', 'postgres'),
    password: config.get<string>('database.password', 'postgres'),
    database: config.get<string>('database.name', 'fleet_management'),
    ssl:
      process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized:
              process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : false,
  };
}

/** Same connection settings as Nest, for TypeORM CLI (`npm run migration:run`). */
export function typeOrmOptionsForCli(): DataSourceOptions {
  const root = srcOrDistRoot();
  const synchronize = synchronizeDefault();
  const logging = process.env.DB_LOGGING === 'true';
  const migrationsRun = false;

  if (useSqlite()) {
    return {
      type: 'sqlite',
      database: envString('SQLITE_PATH', 'fleet_management.db'),
      entities: [entityGlob(root)],
      migrations: [migrationGlob(root)],
      synchronize,
      logging,
      migrationsRun,
    };
  }

  const common = {
    type: 'postgres' as const,
    entities: [entityGlob(root)],
    migrations: [migrationGlob(root)],
    synchronize,
    logging,
    migrationsRun,
  };

  const cliDatabaseUrl = envStringOptional('DATABASE_URL');
  if (cliDatabaseUrl) {
    return {
      ...common,
      url: cliDatabaseUrl,
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              rejectUnauthorized:
                process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
            }
          : false,
    };
  }

  return {
    ...common,
    host: envString('DB_HOST', 'localhost'),
    port: parseInt(envString('DB_PORT', '5432'), 10),
    username: envString('DB_USERNAME', 'postgres'),
    password: envString('DB_PASSWORD', 'postgres'),
    database: envString('DB_NAME', 'fleet_management'),
    ssl:
      process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized:
              process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : false,
  };
}
