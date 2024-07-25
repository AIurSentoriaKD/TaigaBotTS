drop schema taigadb;
CREATE SCHEMA `taigadb` DEFAULT CHARACTER SET utf8mb4 ;

use taigadb;

create table discord_users(
	user_id varchar(45) primary key not null,
    username varchar(100) not null
);

create table films(
	id_peli int primary key not null auto_increment,
    title varchar(100) not null,
    anio_estreno varchar(10) not null,
    portada varchar(500) not null,
    score float
);

create table user_filmscore(
	user_id varchar(45),
    id_peli int,
    score int not null,
    foreign key (user_id) references discord_users(user_id),
    foreign key (id_peli) references films(id_peli)
);

DELIMITER //

CREATE TRIGGER update_film_score
AFTER INSERT ON user_filmscore
FOR EACH ROW
BEGIN
    DECLARE avg_score DECIMAL(3, 2);
    
    -- Calcula el promedio de todas las puntuaciones para la película específica usando NEW.film_id
    SELECT AVG(score) INTO avg_score
    FROM user_filmscore
    WHERE id_peli = NEW.id_peli;

    -- Actualiza el campo score de la película en la tabla films con el nuevo promedio
    UPDATE films
    SET score = avg_score
    WHERE id_peli = NEW.id_peli;
END;

//

DELIMITER ;

DELIMITER //

CREATE TRIGGER update_film_score_after_update
AFTER UPDATE ON user_filmscore
FOR EACH ROW
BEGIN
    DECLARE avg_score DECIMAL(3, 2);
    
    -- Calcula el promedio de todas las puntuaciones para la película específica usando NEW.film_id
    SELECT AVG(score) INTO avg_score
    FROM user_filmscore
    WHERE id_peli = NEW.id_peli;

    -- Actualiza el campo score de la película en la tabla films con el nuevo promedio
    UPDATE films
    SET score = avg_score
    WHERE id_peli = NEW.id_peli;
END;

//

DELIMITER ;
