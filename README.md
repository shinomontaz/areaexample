# areaexample

---- CREATE DATABASE ---
```
 CREATE DATABASE areaexample;
 CREATE USER areaexample WITH PASSWORD 'areaexample';
 /c areaexample
 CREATE EXTENSION postgis;
 CREATE EXTENSION postgis_topology;
 GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pguser;
 GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO areaexample;
 GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO areaexample;
```
---- fill it ---
```
> psql areaexample < db.sql
```
---- nginx config ---
```
server {
    listen 80;
    server_name areaexample.loc;
    root /var/www/areaexample/src/public;

    try_files $uri /index.php?$args;

    location ~ \.php$ {
        internal;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```
--- composer ---
```
> composer update