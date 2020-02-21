CREATE TABLE rooms (
  id serial,
  name text
);

CREATE TABLE users (
  id serial,
  name text,
  room serial
);

INSERT INTO users (name, room) VALUES ('Georges', 1);
INSERT INTO users (name, room) VALUES ('Lucas', 2);

INSERT INTO rooms (name) VALUES ('STARWARS');
INSERT INTO rooms (name) VALUES ('CYBERPUNK');
