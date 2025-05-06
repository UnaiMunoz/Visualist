CREATE DATABASE IF NOT EXISTS Visualist

USE Visualist

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Store hashed passwords
    short_bio TEXT,
    profile_picture VARCHAR(255), -- Store the URL or file path of the profile picture
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Follows (
    follower_id INT,
    followee_id INT,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Content (
    content_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('movie', 'series', 'anime') NOT NULL,
    tmdb_id INT DEFAULT NULL,
    anilist_id INT DEFAULT NULL,
    CONSTRAINT unique_tmdb_id UNIQUE (tmdb_id),
    CONSTRAINT unique_anilist_id UNIQUE (anilist_id),
    CHECK (tmdb_id IS NOT NULL OR anilist_id IS NOT NULL)  -- Ensure at least one ID is present
);

CREATE TABLE Reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    content_id INT,
    rating DECIMAL(2,1) CHECK (rating BETWEEN 0.5 AND 10.0),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES Content(content_id) ON DELETE CASCADE
);

CREATE TABLE Review_Likes (
    user_id INT,
    review_id INT,
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, review_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES Reviews(review_id) ON DELETE CASCADE
);

CREATE TABLE User_Content_Status (
    user_id INT,
    content_id INT,
    status ENUM('watchlist', 'watched') NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  
    PRIMARY KEY (user_id, content_id),  -- Prevents duplicate entries
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES Content(content_id) ON DELETE CASCADE
);

CREATE TABLE Favorites (
    user_id INT,
    content_id INT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, content_id),  -- Users can favorite any movie, even if already watched
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES Content(content_id) ON DELETE CASCADE
);

CREATE TABLE Custom_Lists (
    list_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name),  -- Prevent duplicate lists per user
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Custom_List_Content (
    list_id INT NOT NULL,
    content_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (list_id, content_id),
    FOREIGN KEY (list_id) REFERENCES Custom_Lists(list_id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES Content(content_id) ON DELETE CASCADE
);
