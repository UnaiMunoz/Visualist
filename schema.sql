CREATE DATABASE IF NOT EXISTS Visualist;

USE Visualist;

-- Tabla de usuarios con información básica del perfil
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    birthday DATE,
    gender VARCHAR(50), 
    short_bio TEXT,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

-- Tabla con referencias al contenido (usando solo TMDB para movies y series)
CREATE TABLE Content_References (
    reference_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('movie', 'series') NOT NULL,
    tmdb_id INT NOT NULL,
    title VARCHAR(255) NOT NULL, -- Guardar título para facilitar búsquedas sin llamar a la API
    year YEAR, -- Año de lanzamiento para facilitar filtros
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT unique_tmdb_id UNIQUE (tmdb_id, type),
    INDEX (type, title)
);

-- Estado del usuario para cada contenido 
CREATE TABLE User_Content_Status (
    user_id INT,
    reference_id INT,
    status ENUM('plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped') NOT NULL,
    progress INT DEFAULT 0, -- Episodios vistos o porcentaje
    score DECIMAL(3,1) DEFAULT NULL CHECK (score BETWEEN 0 AND 10.0),
    start_date DATE,
    finish_date DATE,
    notes TEXT,
    private BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, reference_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reference_id) REFERENCES Content_References(reference_id) ON DELETE CASCADE,
    INDEX (user_id, status)
);

-- Tabla de favoritos
CREATE TABLE Favorites (
    user_id INT,
    reference_id INT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, reference_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reference_id) REFERENCES Content_References(reference_id) ON DELETE CASCADE
);

-- Tabla de reseñas
CREATE TABLE Reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    reference_id INT,
    rating DECIMAL(3,1) CHECK (rating BETWEEN 0.5 AND 10.0),
    review_text TEXT,
    contains_spoilers BOOLEAN DEFAULT FALSE,
    private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reference_id) REFERENCES Content_References(reference_id) ON DELETE CASCADE,
    INDEX (user_id),
    INDEX (reference_id)
);

-- Tabla de likes para reseñas
CREATE TABLE Review_Likes (
    user_id INT,
    review_id INT,
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, review_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES Reviews(review_id) ON DELETE CASCADE
);

-- Tabla de listas personalizadas
CREATE TABLE Custom_Lists (
    list_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    UNIQUE (user_id, name),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Tabla intermedia para contenido en listas personalizadas
CREATE TABLE Custom_List_Items (
    list_id INT,
    reference_id INT,
    notes TEXT,
    position INT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (list_id, reference_id),
    FOREIGN KEY (list_id) REFERENCES Custom_Lists(list_id) ON DELETE CASCADE,
    FOREIGN KEY (reference_id) REFERENCES Content_References(reference_id) ON DELETE CASCADE
);

-- Tabla de seguidores
CREATE TABLE Follows (
    follower_id INT,
    followee_id INT,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Tabla de actividad del usuario (simplificada)
CREATE TABLE User_Activity (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type ENUM('status_update', 'review', 'list_create', 'follow', 'favorite') NOT NULL,
    reference_id INT NULL, -- Referencia al contenido (si aplica)
    related_id INT NULL, -- ID relacionado según el tipo de actividad
    activity_data JSON, -- Datos adicionales en formato JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reference_id) REFERENCES Content_References(reference_id) ON DELETE SET NULL,
    INDEX (user_id, created_at)
);

-- Tabla de preferencias de usuario
CREATE TABLE User_Preferences (
    user_id INT PRIMARY KEY,
    theme ENUM('light', 'dark', 'system') DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'en',
    privacy_level ENUM('public', 'friends', 'private') DEFAULT 'public',
    email_notifications BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create stored procedures for list management

-- Create stored procedure to add content to Watched list
DELIMITER //
CREATE PROCEDURE add_to_watched(
    IN p_user_id INT,
    IN p_reference_id INT
)
BEGIN
    INSERT INTO User_Content_Status (user_id, reference_id, status)
    VALUES (p_user_id, p_reference_id, 'completed')
    ON DUPLICATE KEY UPDATE 
        status = 'completed',
        updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Create stored procedure to add content to To Watch list
DELIMITER //
CREATE PROCEDURE add_to_to_watch(
    IN p_user_id INT,
    IN p_reference_id INT
)
BEGIN
    INSERT INTO User_Content_Status (user_id, reference_id, status)
    VALUES (p_user_id, p_reference_id, 'plan_to_watch')
    ON DUPLICATE KEY UPDATE 
        status = 'plan_to_watch',
        updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Create stored procedure to add content to Favorites
DELIMITER //
CREATE PROCEDURE add_to_favorites(
    IN p_user_id INT,
    IN p_reference_id INT
)
BEGIN
    INSERT IGNORE INTO Favorites (user_id, reference_id)
    VALUES (p_user_id, p_reference_id);
END //
DELIMITER ;

-- Create stored procedure to remove content from Watched/To Watch lists
DELIMITER //
CREATE PROCEDURE remove_from_status_list(
    IN p_user_id INT,
    IN p_reference_id INT,
    IN p_status VARCHAR(20)
)
BEGIN
    DELETE FROM User_Content_Status 
    WHERE user_id = p_user_id 
    AND reference_id = p_reference_id
    AND status = p_status;
END //
DELIMITER ;

-- Create stored procedure to remove content from Favorites
DELIMITER //
CREATE PROCEDURE remove_from_favorites(
    IN p_user_id INT,
    IN p_reference_id INT
)
BEGIN
    DELETE FROM Favorites 
    WHERE user_id = p_user_id 
    AND reference_id = p_reference_id;
END //
DELIMITER ;

-- Create stored procedure to check a user's list status for content
DELIMITER //
CREATE PROCEDURE check_list_status(
    IN p_user_id INT,
    IN p_reference_id INT
)
BEGIN
    SELECT 
        (SELECT 1 FROM User_Content_Status WHERE user_id = p_user_id AND reference_id = p_reference_id AND status = 'completed') IS NOT NULL AS watched,
        (SELECT 1 FROM User_Content_Status WHERE user_id = p_user_id AND reference_id = p_reference_id AND status = 'plan_to_watch') IS NOT NULL AS to_watch,
        (SELECT 1 FROM Favorites WHERE user_id = p_user_id AND reference_id = p_reference_id) IS NOT NULL AS favorites;
END //
DELIMITER ;

-- Create stored procedure to get total counts for each list type
DELIMITER //
CREATE PROCEDURE get_user_list_counts(
    IN p_user_id INT
)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM User_Content_Status WHERE user_id = p_user_id AND status = 'completed') AS watched_count,
        (SELECT COUNT(*) FROM User_Content_Status WHERE user_id = p_user_id AND status = 'plan_to_watch') AS to_watch_count,
        (SELECT COUNT(*) FROM Favorites WHERE user_id = p_user_id) AS favorites_count;
END //
DELIMITER ;