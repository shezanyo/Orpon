
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
    campaign_id VARCHAR(100) NOT NULL,
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