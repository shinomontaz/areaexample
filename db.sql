CREATE TABLE zone
(
    id SERIAL PRIMARY KEY,
    geom geometry,
    center_x numeric(15,12),
    center_y numeric(15,12),
    name character varying(1024) COLLATE pg_catalog."default"
)
