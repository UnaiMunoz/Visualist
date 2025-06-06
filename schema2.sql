CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    short_bio TEXT,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Content_References table
CREATE TABLE Content_References (
    reference_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('movie', 'series') NOT NULL,
    tmdb_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_content (type, tmdb_id)
);

-- User_Content_Status table
CREATE TABLE User_Content_Status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reference_id INT NOT NULL,
    status ENUM('completed', 'plan_to_watch', 'watching', 'dropped') NOT NULL,
    score DECIMAL(3,1) DEFAULT NULL CHECK (score >= 0 AND score <= 10),
    progress INT DEFAULT 0,
    time_watched INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reference_id) REFERENCES Content_References(reference_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_content (user_id, reference_id)
);

-- Favorites table
CREATE TABLE Favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reference_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reference_id) REFERENCES Content_References(reference_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_favorite (user_id, reference_id)
);

-- Indexes for better performance
CREATE INDEX idx_user_content_status_user ON User_Content_Status(user_id);
CREATE INDEX idx_user_content_status_reference ON User_Content_Status(reference_id);
CREATE INDEX idx_favorites_user ON Favorites(user_id);
CREATE INDEX idx_content_refs_type_tmdb ON Content_References(type, tmdb_id);