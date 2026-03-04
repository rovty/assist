-- init-db.sql
-- Creates separate schemas/databases for local development

-- Auth & Tenant tables will be created by Prisma migrations
-- This file sets up extensions and initial configuration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create schemas for logical separation
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS tenant;
CREATE SCHEMA IF NOT EXISTS leads;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS knowledge_base;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'Assist database initialized successfully';
END $$;
