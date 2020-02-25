CREATE TABLE users (
  id serial,
  name text,
  room serial
);

INSERT INTO users (name, room) VALUES ('Georges', 1);
INSERT INTO users (name, room) VALUES ('Lucas', 2);
