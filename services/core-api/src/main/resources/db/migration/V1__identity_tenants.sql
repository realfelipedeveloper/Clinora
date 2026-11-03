CREATE TABLE tenant (
    id UUID PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    status VARCHAR(12) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT tenant_slug_not_blank CHECK (length(trim(slug)) > 0)
);

CREATE TABLE external_identity (
    id UUID PRIMARY KEY,
    issuer VARCHAR(512) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT external_identity_issuer_not_blank CHECK (length(trim(issuer)) > 0),
    CONSTRAINT external_identity_subject_not_blank CHECK (length(trim(subject)) > 0),
    CONSTRAINT external_identity_issuer_subject UNIQUE (issuer, subject)
);

CREATE TABLE membership (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
    identity_id UUID NOT NULL REFERENCES external_identity(id) ON DELETE RESTRICT,
    role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'RECEPTION', 'PROFESSIONAL', 'PATIENT')),
    status VARCHAR(12) NOT NULL CHECK (status IN ('ACTIVE', 'REVOKED')),
    version BIGINT NOT NULL DEFAULT 0 CHECK (version >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    CONSTRAINT membership_revocation_consistent CHECK ((status = 'REVOKED') = (revoked_at IS NOT NULL)),
    CONSTRAINT membership_identity_per_tenant UNIQUE (tenant_id, identity_id),
    CONSTRAINT membership_tenant_id_id UNIQUE (tenant_id, id)
);

CREATE INDEX membership_identity_status ON membership (identity_id, status, tenant_id);

CREATE TABLE tenant_unit (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
    code VARCHAR(80) NOT NULL,
    status VARCHAR(12) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT tenant_unit_code_not_blank CHECK (length(trim(code)) > 0),
    CONSTRAINT tenant_unit_tenant_id_id UNIQUE (tenant_id, id),
    CONSTRAINT tenant_unit_code_per_tenant UNIQUE (tenant_id, code)
);

CREATE TABLE unit_assignment (
    tenant_id UUID NOT NULL,
    membership_id UUID NOT NULL,
    unit_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, membership_id, unit_id),
    CONSTRAINT unit_assignment_membership_same_tenant FOREIGN KEY (tenant_id, membership_id)
        REFERENCES membership(tenant_id, id) ON DELETE RESTRICT,
    CONSTRAINT unit_assignment_unit_same_tenant FOREIGN KEY (tenant_id, unit_id)
        REFERENCES tenant_unit(tenant_id, id) ON DELETE RESTRICT
);

CREATE TABLE professional_assignment (
    tenant_id UUID NOT NULL,
    membership_id UUID NOT NULL,
    professional_membership_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, membership_id, professional_membership_id),
    CONSTRAINT professional_assignment_actor_same_tenant FOREIGN KEY (tenant_id, membership_id)
        REFERENCES membership(tenant_id, id) ON DELETE RESTRICT,
    CONSTRAINT professional_assignment_target_same_tenant FOREIGN KEY (tenant_id, professional_membership_id)
        REFERENCES membership(tenant_id, id) ON DELETE RESTRICT
);
