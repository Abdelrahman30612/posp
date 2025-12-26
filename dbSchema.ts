
export const SQL_SCHEMA = `
-- CloudPOS Database Schema (PostgreSQL)

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location TEXT
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) CHECK (role IN ('ADMIN', 'MANAGER', 'CASHIER')),
    branch_id UUID REFERENCES branches(id)
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id),
    base_price DECIMAL(12, 2) NOT NULL
);

CREATE TABLE stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    branch_id UUID REFERENCES branches(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    UNIQUE(product_id, branch_id)
);

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    cashier_id UUID REFERENCES users(id),
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id),
    amount DECIMAL(12, 2) NOT NULL,
    method VARCHAR(50),
    transaction_id VARCHAR(255)
);
`;

export const ERD_DIAGRAM = `
[Branch] 1 -- * [User]
[Branch] 1 -- * [Stock]
[Branch] 1 -- * [Sale]

[Category] 1 -- * [Product]
[Product] 1 -- * [Stock]
[Product] 1 -- * [Sale_Item]

[User] (Cashier) 1 -- * [Sale]

[Sale] 1 -- * [Sale_Item]
[Sale] 1 -- 1 [Payment]
`;
