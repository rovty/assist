-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE', 'MICROSOFT', 'SSO', 'OIDC', 'SAML', 'UNKNOWN');

-- CreateTable
CREATE TABLE "auth_identities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "supabase_user_id" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL DEFAULT 'UNKNOWN',
    "provider_user_id" TEXT,
    "email" CITEXT,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sso_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "domain" TEXT,
    "display_name" TEXT,
    "oidc_issuer" TEXT,
    "client_id" TEXT,
    "metadata_url" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sso_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_identities_provider_provider_user_id_key" ON "auth_identities"("provider", "provider_user_id");

-- CreateIndex
CREATE INDEX "auth_identities_user_id_idx" ON "auth_identities"("user_id");

-- CreateIndex
CREATE INDEX "auth_identities_supabase_user_id_idx" ON "auth_identities"("supabase_user_id");

-- CreateIndex
CREATE INDEX "sso_connections_tenant_id_idx" ON "sso_connections"("tenant_id");

-- CreateIndex
CREATE INDEX "sso_connections_domain_idx" ON "sso_connections"("domain");

-- AddForeignKey
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sso_connections" ADD CONSTRAINT "sso_connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
