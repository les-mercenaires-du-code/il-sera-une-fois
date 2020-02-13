CREATE TABLE cards (
  id serial,
  name text,
  type text,
  interruption boolean
);

CREATE TABLE endings (
  id serial,
  ending text
);

CREATE TABLE rooms (
  id serial,
  name text
);

CREATE TABLE users (
  id serial,
  name text,
  room integer
);

INSERT INTO users (name, room) VALUES ('Georges', 0);
INSERT INTO users (name, room) VALUES ('Lucas', 1);

INSERT INTO rooms (name) VALUES ('STARWARS');
INSERT INTO rooms (name) VALUES ('CYBERPUNK');


INSERT INTO endings (ending) VALUES ('La destruction de l''usine plongea la cité à tout jamais dans le noir');
INSERT INTO endings (ending) VALUES ('La démocratie fut ainsi restauré pendant un temps');
INSERT INTO endings (ending) VALUES ('La course à la conquête de l''espace fut lancé');
INSERT INTO endings (ending) VALUES ('Et alors les deux peuples vécurent en paix');
INSERT INTO endings (ending) VALUES ('Le temps des humains fut révolu et laissa sa place à celui des cyborgs');


INSERT INTO cards (name, type, interruption) VALUES ('Centre commercial', 'Lieu', false);
INSERT INTO cards (name, type, interruption) VALUES ('Egouts', 'Lieu', false);
INSERT INTO cards (name, type, interruption) VALUES ('Bar', 'Lieu', false);
INSERT INTO cards (name, type, interruption) VALUES ('Hangar', 'Lieu', false);
INSERT INTO cards (name, type, interruption) VALUES ('Décharge', 'Lieu', true);

INSERT INTO cards (name, type, interruption) VALUES ('Batte de baseball', 'Objet', false);
INSERT INTO cards (name, type, interruption) VALUES ('Bras robotique', 'Objet', true);
INSERT INTO cards (name, type, interruption) VALUES ('Ordinateur', 'Objet', false);
INSERT INTO cards (name, type, interruption) VALUES ('Bombe', 'Objet', false);
INSERT INTO cards (name, type, interruption) VALUES ('Fusil', 'Objet', false);

INSERT INTO cards (name, type, interruption) VALUES ('Gredin', 'Personnage', false);
INSERT INTO cards (name, type, interruption) VALUES ('Recelleur', 'Personnage', true);
INSERT INTO cards (name, type, interruption) VALUES ('Dealer', 'Personnage', false);
INSERT INTO cards (name, type, interruption) VALUES ('Policier', 'Personnage', false);
INSERT INTO cards (name, type, interruption) VALUES ('Senateur', 'Personnage', false);
INSERT INTO cards (name, type, interruption) VALUES ('Hackeur', 'Personnage', false);

INSERT INTO cards (name, type, interruption) VALUES ('Mourant', 'Aspect', false);
INSERT INTO cards (name, type, interruption) VALUES ('En fuite', 'Aspect', true);
INSERT INTO cards (name, type, interruption) VALUES ('Tres fort', 'Aspect', false);
INSERT INTO cards (name, type, interruption) VALUES ('Caché', 'Aspect', false);
INSERT INTO cards (name, type, interruption) VALUES ('Laid', 'Aspect', false);

INSERT INTO cards (name, type, interruption) VALUES ('Une explosion', 'Evenement', false);
INSERT INTO cards (name, type, interruption) VALUES ('La nuit tombe', 'Evenement', true);
INSERT INTO cards (name, type, interruption) VALUES ('Un combat', 'Evenement', false);
INSERT INTO cards (name, type, interruption) VALUES ('Qui dort', 'Evenement', false);
INSERT INTO cards (name, type, interruption) VALUES ('Est blessé', 'Evenement', false);
