# NestJS Module Creation Guide

Use this prompt to generate a new NestJS module that mirrors the structure and conventions of our codebase. It must include the same file layout, DTO validation, service/repository pattern, standardized responses, and consistent error handling.

````text
You are generating a new NestJS module for a TypeScript backend project. Follow these exact conventions from our codebase. Create the module in the modules folder:

  src/modules/<module-name>/

Create exactly these files (inside the module's directory):
  1) dto/create-<entity>.dto.ts
  2) dto/update-<entity>.dto.ts
  3) dto/query-<entity>.dto.ts
  4) entities/<entity>.entity.ts
  5) <module-name>.controller.ts
  6) <module-name>.service.ts
  7) <module-name>.module.ts
  8) <module-name>.controller.spec.ts
  9) <module-name>.service.spec.ts

General rules:
- Use TypeScript and NestJS decorators.
- All DTOs use `class-validator` decorators for validation.
- All DTOs use `class-transformer` decorators (`@Expose`, `@Type`) where needed.
- Controllers handle HTTP concerns only — no business logic.
- Services contain all business logic and database interactions.
- Use TypeORM repositories injected via `@InjectRepository`.
- Use the standardized `ApiResponse<T>` wrapper for all responses.
- Use NestJS built-in exceptions (`NotFoundException`, `BadRequestException`, etc.) — never throw raw errors.
- All endpoints are decorated with `@ApiTags`, `@ApiOperation`, and `@ApiResponse` for Swagger docs.
- Route paths use kebab-case and are prefixed with `api/v1/`.
- Use `@UseGuards(JwtAuthGuard)` on protected endpoints.
- Group imports: NestJS core → third-party → internal modules → local files.

Naming placeholders (replace everywhere):
- <ModuleNamePascal>   e.g., `Employee`
- <moduleNameCamel>    e.g., `employee`
- <module-name-kebab>  e.g., `employee`
- <MODULE_NAME_UPPER>  e.g., `EMPLOYEE`
- <ENTITY_A>, <ENTITY_B> represent your domain pieces.

--------------------------------------------------------------------------------
File: entities/<entity>.entity.ts (TypeORM entity)
--------------------------------------------------------------------------------
- Define the database entity with TypeORM decorators.
- Use `uuid` as the primary key strategy.
- Include `createdAt` and `updatedAt` timestamp columns.
- Use `@Column` with explicit types and constraints.
- Define relations with `@ManyToOne`, `@OneToMany`, etc. as needed.

Example skeleton:
```ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('<module_name_snake>')
export class <ModuleNamePascal> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

--------------------------------------------------------------------------------
File: dto/create-<entity>.dto.ts (create DTO with validation)
--------------------------------------------------------------------------------
- Use `class-validator` decorators on every field.
- Use `@ApiProperty()` from `@nestjs/swagger` on every field for Swagger docs.
- Mark optional fields with `@IsOptional()` and `@ApiPropertyOptional()`.
- Never include `id`, `createdAt`, or `updatedAt` — these are server-generated.

Example:
```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class Create<ModuleNamePascal>Dto {
  @ApiProperty({ description: 'Full name', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Email address', maxLength: 255 })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

--------------------------------------------------------------------------------
File: dto/update-<entity>.dto.ts (update DTO — partial of create)
--------------------------------------------------------------------------------
- Extend `PartialType` from `@nestjs/swagger` (NOT `@nestjs/mapped-types`) to get both validation and Swagger support.
- This makes all fields optional while keeping validation.

Example:
```ts
import { PartialType } from '@nestjs/swagger';

import { Create<ModuleNamePascal>Dto } from './create-<module-name-kebab>.dto';

export class Update<ModuleNamePascal>Dto extends PartialType(
  Create<ModuleNamePascal>Dto
) {}
```

--------------------------------------------------------------------------------
File: dto/query-<entity>.dto.ts (query/filter DTO for GET list endpoints)
--------------------------------------------------------------------------------
- Define pagination and filter parameters.
- Use `@Type(() => Number)` from `class-transformer` for query param type coercion.
- All fields are optional.

Example:
```ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class Query<ModuleNamePascal>Dto {
  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsString()
  @IsOptional()
  search?: string;
}
```

--------------------------------------------------------------------------------
File: <module-name>.controller.ts (HTTP layer only)
--------------------------------------------------------------------------------
- Decorate the class with `@ApiTags('<module-name-kebab>')` and `@Controller('api/v1/<module-name-kebab>')`.
- Inject the service via constructor.
- Each method is decorated with HTTP method decorator, `@ApiOperation`, and `@ApiResponse`.
- Use `@UseGuards(JwtAuthGuard)` on the class or individual methods for auth.
- Parse path params with `@Param('id', ParseUUIDPipe)`.
- Parse body with `@Body()` — validation is automatic via `ValidationPipe` (global).
- Parse query with `@Query()`.
- Controllers NEVER contain business logic — delegate everything to the service.

Example:
```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

import { Create<ModuleNamePascal>Dto } from './dto/create-<module-name-kebab>.dto';
import { Query<ModuleNamePascal>Dto } from './dto/query-<module-name-kebab>.dto';
import { Update<ModuleNamePascal>Dto } from './dto/update-<module-name-kebab>.dto';
import { <ModuleNamePascal>Service } from './<module-name-kebab>.service';

@ApiTags('<module-name-kebab>')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/<module-name-kebab>')
export class <ModuleNamePascal>Controller {
  constructor(private readonly <moduleNameCamel>Service: <ModuleNamePascal>Service) {}

  @Post()
  @ApiOperation({ summary: 'Create a new <moduleNameCamel>' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: Create<ModuleNamePascal>Dto) {
    return this.<moduleNameCamel>Service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all <moduleNameCamel> records' })
  @ApiResponse({ status: 200, description: 'List retrieved' })
  findAll(@Query() query: Query<ModuleNamePascal>Dto) {
    return this.<moduleNameCamel>Service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a <moduleNameCamel> by ID' })
  @ApiResponse({ status: 200, description: 'Record found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.<moduleNameCamel>Service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a <moduleNameCamel>' })
  @ApiResponse({ status: 200, description: 'Updated successfully' })
  @ApiResponse({ status: 404, description: 'Not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Update<ModuleNamePascal>Dto,
  ) {
    return this.<moduleNameCamel>Service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a <moduleNameCamel>' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  @ApiResponse({ status: 404, description: 'Not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.<moduleNameCamel>Service.remove(id);
  }
}
```

--------------------------------------------------------------------------------
File: <module-name>.service.ts (business logic + DB interaction)
--------------------------------------------------------------------------------
- Inject `Repository<<ModuleNamePascal>>` via `@InjectRepository`.
- Wrap all responses in the standardized `ApiResponse<T>` shape.
- Throw NestJS exceptions for error cases.
- Handle pagination with `skip` and `take` from TypeORM.
- Use `ILike` for case-insensitive search filters.

Example:
```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Create<ModuleNamePascal>Dto } from './dto/create-<module-name-kebab>.dto';
import { Query<ModuleNamePascal>Dto } from './dto/query-<module-name-kebab>.dto';
import { Update<ModuleNamePascal>Dto } from './dto/update-<module-name-kebab>.dto';
import { <ModuleNamePascal> } from './entities/<module-name-kebab>.entity';

@Injectable()
export class <ModuleNamePascal>Service {
  constructor(
    @InjectRepository(<ModuleNamePascal>)
    private readonly <moduleNameCamel>Repository: Repository<<ModuleNamePascal>>,
  ) {}

  async create(dto: Create<ModuleNamePascal>Dto) {
    const entity = this.<moduleNameCamel>Repository.create(dto);
    const saved = await this.<moduleNameCamel>Repository.save(entity);

    return {
      success: true,
      message: '<ModuleNamePascal> created successfully',
      data: saved,
    };
  }

  async findAll(query: Query<ModuleNamePascal>Dto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [data, total] = await this.<moduleNameCamel>Repository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: '<ModuleNamePascal> list retrieved',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const entity = await this.<moduleNameCamel>Repository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(`<ModuleNamePascal> with ID "${id}" not found`);
    }

    return {
      success: true,
      message: '<ModuleNamePascal> retrieved',
      data: entity,
    };
  }

  async update(id: string, dto: Update<ModuleNamePascal>Dto) {
    const entity = await this.<moduleNameCamel>Repository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(`<ModuleNamePascal> with ID "${id}" not found`);
    }

    Object.assign(entity, dto);
    const updated = await this.<moduleNameCamel>Repository.save(entity);

    return {
      success: true,
      message: '<ModuleNamePascal> updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const entity = await this.<moduleNameCamel>Repository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(`<ModuleNamePascal> with ID "${id}" not found`);
    }

    await this.<moduleNameCamel>Repository.remove(entity);

    return {
      success: true,
      message: '<ModuleNamePascal> deleted successfully',
      data: null,
    };
  }
}
```

--------------------------------------------------------------------------------
File: <module-name>.module.ts (NestJS module wiring)
--------------------------------------------------------------------------------
- Import `TypeOrmModule.forFeature([<Entity>])` to register the repository.
- Declare the controller and service.
- Export the service if other modules need it.

Example:
```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { <ModuleNamePascal> } from './entities/<module-name-kebab>.entity';
import { <ModuleNamePascal>Controller } from './<module-name-kebab>.controller';
import { <ModuleNamePascal>Service } from './<module-name-kebab>.service';

@Module({
  imports: [TypeOrmModule.forFeature([<ModuleNamePascal>])],
  controllers: [<ModuleNamePascal>Controller],
  providers: [<ModuleNamePascal>Service],
  exports: [<ModuleNamePascal>Service],
})
export class <ModuleNamePascal>Module {}
```

--------------------------------------------------------------------------------
File: src/app.module.ts (wire the new module)
--------------------------------------------------------------------------------
After creating the module, import it in `src/app.module.ts`:

```ts
import { <ModuleNamePascal>Module } from './modules/<module-name-kebab>/<module-name-kebab>.module';

@Module({
  imports: [
    // ... existing modules
    <ModuleNamePascal>Module, // Add this line
  ],
})
export class AppModule {}
```
````

---

## Project Initialization (mirrors UI tooling)

### 1. Create NestJS project

```bash
mkdir hrm_api && cd hrm_api
npx @nestjs/cli new . --strict --skip-git --package-manager npm
```

### 2. Install core dependencies

```bash
# Database & validation
npm install @nestjs/typeorm typeorm pg
npm install class-validator class-transformer

# Swagger
npm install @nestjs/swagger

# Auth
npm install @nestjs/passport passport passport-jwt @nestjs/jwt
npm install -D @types/passport-jwt

# Config
npm install @nestjs/config
```

### 3. Install tooling (same as UI)

```bash
# Prettier + ESLint integration
npm install -D prettier eslint-config-prettier eslint-plugin-prettier

# Husky + lint-staged
npm install -D husky lint-staged

# Initialize git and husky
git init
npx husky init
```

### 4. Configure Prettier (`.prettierrc` — same as UI)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 5. Configure ESLint (`.eslintrc.js`)

NestJS uses legacy `.eslintrc.js` config (not flat config). Keep these rules aligned with the UI project:

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/**'],
  rules: {
    'prettier/prettier': 'warn',

    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],

    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-duplicates': 'warn',
  },
};
```

### 6. Configure lint-staged and Husky (same as UI)

Add to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "lint:fix": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\" \"test/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

Write the Husky pre-commit hook (`.husky/pre-commit`):

```bash
npx lint-staged
```

### 7. Environment config (`.env.example`)

```env
# App
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=
DB_NAME=hrm_db

# JWT
JWT_SECRET=
JWT_EXPIRATION=1d
```

---

## Project Structure

```
hrm_api/
├── .env.example
├── .eslintrc.js
├── .husky/
│   └── pre-commit
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
│
├── src/
│   ├── main.ts                           # Bootstrap, global pipes, Swagger setup
│   ├── app.module.ts                     # Root module — imports all feature modules
│   │
│   ├── config/                           # Environment & app configuration
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   │
│   ├── common/                           # Shared utilities across modules
│   │   ├── decorators/                   # Custom decorators (@CurrentUser, etc.)
│   │   ├── filters/                      # Exception filters (HttpExceptionFilter)
│   │   ├── guards/                       # Shared guards
│   │   ├── interceptors/                 # Response transform, logging
│   │   ├── interfaces/                   # Shared interfaces (ApiResponse, Pagination)
│   │   └── pipes/                        # Custom pipes
│   │
│   └── modules/                          # Feature modules (one folder per domain)
│       ├── auth/                         # Auth module (JWT, login, register)
│       │   ├── dto/
│       │   ├── guards/
│       │   ├── strategies/
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   └── auth.module.ts
│       │
│       └── <module-name>/                # Feature module (repeat per domain)
│           ├── dto/
│           │   ├── create-<entity>.dto.ts
│           │   ├── update-<entity>.dto.ts
│           │   └── query-<entity>.dto.ts
│           ├── entities/
│           │   └── <entity>.entity.ts
│           ├── <module-name>.controller.ts
│           ├── <module-name>.service.ts
│           ├── <module-name>.module.ts
│           ├── <module-name>.controller.spec.ts
│           └── <module-name>.service.spec.ts
│
└── test/                                 # E2E tests
    ├── app.e2e-spec.ts
    └── jest-e2e.json
```

---

## Core Setup Files

### File: src/main.ts (bootstrap with global config)

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  const config = new DocumentBuilder()
    .setTitle('HRM API')
    .setDescription('Human Resource Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
```

### File: src/app.module.ts (root module)

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_NAME', 'hrm_db'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        ssl:
          configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    AuthModule,
    // Import new feature modules here
  ],
})
export class AppModule {}
```

### File: src/common/interfaces/api-response.interface.ts

```ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### File: src/common/filters/http-exception.filter.ts

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : ((
              exceptionResponse as Record<string, unknown>
            ).message?.toString() ?? exception.message);
    }

    response.status(status).json({
      success: false,
      message,
      data: null,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## Checklist (must-haves)

- [ ] Directory: `src/modules/<module-name-kebab>/`
- [ ] Files: `dto/create-*.dto.ts`, `dto/update-*.dto.ts`, `dto/query-*.dto.ts`, `entities/*.entity.ts`, `*.controller.ts`, `*.service.ts`, `*.module.ts`
- [ ] Entity has UUID primary key, `createdAt`, `updatedAt`
- [ ] All DTO fields have `class-validator` decorators
- [ ] All DTO fields have `@ApiProperty` / `@ApiPropertyOptional` for Swagger
- [ ] Update DTO extends `PartialType(CreateDto)` from `@nestjs/swagger`
- [ ] Query DTO has pagination (`page`, `limit`) with `@Type(() => Number)`
- [ ] Controller uses `@ApiTags`, `@ApiOperation`, `@ApiResponse` decorators
- [ ] Controller uses `ParseUUIDPipe` for `:id` params
- [ ] Controller delegates ALL logic to service — no business logic in controllers
- [ ] Service uses `@InjectRepository` for database access
- [ ] Service throws NestJS exceptions (`NotFoundException`, etc.)
- [ ] All responses use `{ success, message, data }` shape
- [ ] Paginated responses include `meta: { total, page, limit, totalPages }`
- [ ] Module imports `TypeOrmModule.forFeature([Entity])`
- [ ] Module is imported in `app.module.ts`
- [ ] `@UseGuards(JwtAuthGuard)` on protected endpoints

---

## Adding a New Endpoint to an Existing Module

When adding a new endpoint to an existing module, follow these steps:

1. **dto/**: Create new DTO if the endpoint needs new request validation
2. **entities/**: Update entity if new columns are needed
3. **service**: Add the new method with business logic
4. **controller**: Add the new route method with Swagger decorators, delegate to service
5. **spec files**: Add tests for the new endpoint

---

## Tooling Parity with UI Project

| Tool             | UI (`hrm_ui`)                                              | API (`hrm_api`)                                            |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| **Prettier**     | `.prettierrc` (same config)                                | `.prettierrc` (same config, no tailwind plugin)            |
| **ESLint**       | `eslint.config.mjs` (flat)                                 | `.eslintrc.js` (legacy — NestJS default)                   |
| **ESLint Rules** | Same core rules                                            | Same core rules (minus React-specific)                     |
| **Husky**        | `.husky/pre-commit`                                        | `.husky/pre-commit`                                        |
| **lint-staged**  | `package.json`                                             | `package.json`                                             |
| **TypeScript**   | Strict mode                                                | Strict mode                                                |
| **Import Order** | Alphabetical, grouped                                      | Alphabetical, grouped                                      |
| **Scripts**      | `lint`, `lint:fix`, `format`, `format:check`, `type-check` | `lint`, `lint:fix`, `format`, `format:check`, `type-check` |

---

## Quick Reference: Module File Structure

```
src/modules/<module-name-kebab>/
├── dto/
│   ├── create-<entity>.dto.ts    # Create validation + Swagger
│   ├── update-<entity>.dto.ts    # Partial of create (PartialType)
│   └── query-<entity>.dto.ts     # Pagination + filters
├── entities/
│   └── <entity>.entity.ts        # TypeORM entity definition
├── <module-name>.controller.ts   # HTTP routes + Swagger docs
├── <module-name>.service.ts      # Business logic + DB queries
├── <module-name>.module.ts       # NestJS module wiring
├── <module-name>.controller.spec.ts
└── <module-name>.service.spec.ts
```
