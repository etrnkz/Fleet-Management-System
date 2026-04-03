import { join } from 'node:path';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { ConfigService } from '@nestjs/config';
import type { DataSourceOptions } from 'typeorm';
import { envString, envStringOptional, envTrimmed } from '../config/env.util';

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
  const sync = envTrimmed('DB_SYNCHRONIZE').toLowerCase();
  if (sync === 'true') return true;
  if (sync === 'false') return false;
  if (useSqlite()) return true;
  const nodeEnv = envTrimmed('NODE_ENV') || 'development';
  return nodeEnv !== 'production';
}

function srcOrDistRoot(): string {
  return join(__dirname, '..');
}

export function typeOrmOptionsForNest(config: ConfigService): TypeOrmModuleOptions {
  const root = srcOrDistRoot();
  const synchronize = synchronizeDefault();
  const logging =
    config.get<boolean | string>('database.logging') === true ||
    envTrimmed('DB_LOGGING').toLowerCase() === 'true';
  const migrationsRun =
    envTrimmed('DB_RUN_MIGRATIONS').toLowerCase() === 'true';

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
        envTrimmed('DB_SSL').toLowerCase() === 'true'
          ? {
              rejectUnauthorized:
                envTrimmed('DB_SSL_REJECT_UNAUTHORIZED').toLowerCase() !==
                'false',
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
      envTrimmed('DB_SSL').toLowerCase() === 'true'
        ? {
            rejectUnauthorized:
              envTrimmed('DB_SSL_REJECT_UNAUTHORIZED').toLowerCase() !==
              'false',
          }
        : false,
  };
}

/** Same connection settings as Nest, for TypeORM CLI (`npm run migration:run`). */
export function typeOrmOptionsForCli(): DataSourceOptions {
  const root = srcOrDistRoot();
  const synchronize = synchronizeDefault();
  const logging = envTrimmed('DB_LOGGING').toLowerCase() === 'true';
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
        envTrimmed('DB_SSL').toLowerCase() === 'true'
          ? {
              rejectUnauthorized:
                envTrimmed('DB_SSL_REJECT_UNAUTHORIZED').toLowerCase() !==
                'false',
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
      envTrimmed('DB_SSL').toLowerCase() === 'true'
        ? {
            rejectUnauthorized:
              envTrimmed('DB_SSL_REJECT_UNAUTHORIZED').toLowerCase() !==
              'false',
          }
        : false,
  };
}
