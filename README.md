
sudo /opt/lampp/manager-linux-x64.run


Sql 

CREATE TABLE donations (
    id VARCHAR(100) PRIMARY KEY,
    donor_name VARCHAR(255),
    privacy_type ENUM('public', 'anonymous', 'pseudonym') NOT NULL,
    display_name VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    previous_hash TEXT NOT NULL,
    current_hash TEXT NOT NULL,
    batch_id INT DEFAULT 0
);

CREATE TABLE blockchain_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT UNIQUE,
    final_hash TEXT NOT NULL,
    blockchain_tx_hash TEXT,
    anchored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-----------------------------------------------------------

CREATE TABLE campaigns (
    id VARCHAR(100) PRIMARY KEY,
    user_id INT NOT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(12,2) NOT NULL,
    collected_amount DECIMAL(12,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
);
-----------------------------------------------------------
ALTER TABLE donations
ADD COLUMN campaign_id VARCHAR(100),
ADD FOREIGN KEY (campaign_id)
REFERENCES campaigns(id);

