DROP TABLE IF EXISTS "events";
DROP SEQUENCE IF EXISTS events_id_seq;
CREATE SEQUENCE events_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;

CREATE TABLE "public"."events" (
    "id" integer DEFAULT nextval('events_id_seq') NOT NULL,
    "performance_id" integer,
    "topic" text NOT NULL,
    "mqtt_timestamp" double precision NOT NULL,
    "created" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "payload" json NOT NULL,
    CONSTRAINT "events_id" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "events_created" ON "public"."events" USING btree ("created");

CREATE INDEX "events_performance_id" ON "public"."events" USING btree ("performance_id");