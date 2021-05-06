DROP TABLE IF EXISTS "scene";
DROP TABLE IF EXISTS "parent_stage";
DROP TABLE IF EXISTS "parent_asset";
DROP TABLE IF EXISTS "live_performance_mqtt_config";
DROP TABLE IF EXISTS "performance";
CREATE TABLE "public"."parent_stage" (
    "id" BIGSERIAL NOT NULL,
    "stage_id" integer NOT NULL,
    "child_asset_id" integer NOT NULL,
    FOREIGN KEY (stage_id) REFERENCES stage(id),
    FOREIGN KEY (child_asset_id) REFERENCES asset(id),
    PRIMARY KEY ("id")
);
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE TABLE "public"."parent_asset" (
    "id" BIGSERIAL NOT NULL,
    "asset_id" integer NOT NULL,
    "child_asset_id" integer NOT NULL,
    FOREIGN KEY (asset_id) REFERENCES asset(id),
    FOREIGN KEY (child_asset_id) REFERENCES asset(id),
    PRIMARY KEY ("id")
);
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE TABLE "public"."performance" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NULL,
    "description" TEXT NULL,
    "stage_id" integer NOT NULL,
    "created_on" timestamp DEFAULT (now() at time zone 'utc'),
    "expires_on" timestamp DEFAULT null,
    FOREIGN KEY (stage_id) REFERENCES stage(id),
    PRIMARY KEY ("id")
);
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE TABLE "public"."scene" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT not null,
    "scene_order" integer not null default 0,
    "owner_id" integer not null default 0,
    "description" TEXT not null,
    "created_on" timestamp DEFAULT (now() at time zone 'utc'),
    "expires_on" timestamp DEFAULT null,
    "parent_stage_id" integer NOT NULL,
    "performance_id" integer NOT NULL,
    FOREIGN KEY (parent_stage_id) REFERENCES parent_stage(id),
    FOREIGN KEY (performance_id) REFERENCES performance(id),
    FOREIGN KEY (owner_id) REFERENCES upstage_user(id),
    PRIMARY KEY ("id")
);
CREATE INDEX "scene_scene_order_idx" ON "public"."scene" USING btree ("scene_order");
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE TABLE "public"."live_performance_mqtt_config" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT not null,
    "owner_id" integer not null default 0,
    "ip_address" TEXT not null,
    "websocket_port" integer not null default 0,
    "webclient_port" integer not null default 0,
    "topic_name" TEXT unique not null,
    "username" TEXT not null,
    "password" TEXT not null,
    "created_on" timestamp DEFAULT (now() at time zone 'utc'),
    "expires_on" timestamp DEFAULT null,
    "performance_id" integer NOT NULL,
    FOREIGN KEY (performance_id) REFERENCES performance(id),
    FOREIGN KEY (owner_id) REFERENCES upstage_user(id),
    PRIMARY KEY ("id")
);