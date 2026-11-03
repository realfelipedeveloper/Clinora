ALTER TABLE tenant ADD COLUMN display_name VARCHAR(160);
UPDATE tenant SET display_name = slug;
ALTER TABLE tenant ALTER COLUMN display_name SET NOT NULL;
ALTER TABLE tenant ADD CONSTRAINT tenant_display_name_not_blank
    CHECK (length(trim(display_name)) > 0);

CREATE TABLE identity_audit_event (
    id UUID PRIMARY KEY,
    actor_issuer VARCHAR(512) NOT NULL,
    actor_subject VARCHAR(255) NOT NULL,
    tenant_id UUID REFERENCES tenant(id) ON DELETE RESTRICT,
    purpose VARCHAR(80) NOT NULL,
    action VARCHAR(80) NOT NULL,
    result VARCHAR(12) NOT NULL CHECK (result IN ('ALLOWED', 'DENIED')),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT identity_audit_issuer_not_blank CHECK (length(trim(actor_issuer)) > 0),
    CONSTRAINT identity_audit_subject_not_blank CHECK (length(trim(actor_subject)) > 0)
);

CREATE INDEX identity_audit_actor_time
    ON identity_audit_event (actor_issuer, actor_subject, occurred_at DESC);
CREATE INDEX identity_audit_tenant_time
    ON identity_audit_event (tenant_id, occurred_at DESC);
