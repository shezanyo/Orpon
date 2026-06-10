-- ============================================
-- Orpon Database Schema – Azure SQL Database (T-SQL)
-- Run this ONCE on a fresh database to create all tables.
-- ============================================

-- Users table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NULL,
    nid NVARCHAR(20) NULL,
    address NVARCHAR(MAX) NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT unique_phone UNIQUE (phone),
    CONSTRAINT unique_nid UNIQUE (nid)
);

-- Campaigns table
CREATE TABLE campaigns (
    id NVARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    story NVARCHAR(MAX),
    category NVARCHAR(100) DEFAULT 'Community',
    target_amount DECIMAL(12,2) NOT NULL,
    raised_amount DECIMAL(12,2) DEFAULT 0,
    donor_count INT DEFAULT 0,
    days_left INT DEFAULT 30,
    slug NVARCHAR(255),
    organizer_name NVARCHAR(255) DEFAULT 'Community Organizer',
    is_verified BIT DEFAULT 0,
    color NVARCHAR(20) DEFAULT '#1B4332',
    emoji NVARCHAR(10) DEFAULT N'🤲',
    image_url_1 NVARCHAR(MAX) NULL,
    image_url_2 NVARCHAR(MAX) NULL,
    image_url_3 NVARCHAR(MAX) NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Donations table (blockchain-style hash chain)
CREATE TABLE donations (
    id NVARCHAR(36) PRIMARY KEY,
    donor_name NVARCHAR(255),
    privacy_type NVARCHAR(50),
    display_name NVARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    previous_hash NVARCHAR(255),
    current_hash NVARCHAR(255),
    campaign_id NVARCHAR(36),
    payment_method NVARCHAR(50) DEFAULT 'Direct',
    status NVARCHAR(50) DEFAULT 'Completed',
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Comments table
CREATE TABLE comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    campaign_id NVARCHAR(36) NOT NULL,
    user_id INT NOT NULL,
    comment_text NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

