-- OneGovSL Database Schema

-- Create ENUM types
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE user_role AS ENUM ('citizen', 'officer', 'admin');
CREATE TYPE document_status AS ENUM ('pending_review', 'approved', 'rejected');
CREATE TYPE feedback_type AS ENUM ('complaint', 'compliment', 'suggestion');

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    nic VARCHAR(20) UNIQUE, -- National Identity Card
    phone_number VARCHAR(20),
    address TEXT,
    role user_role NOT NULL DEFAULT 'citizen',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL, -- For officers
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: services
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (department_id, name) -- Service names should be unique per department
);

-- Table: appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Citizen booking the appointment
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    officer_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Officer assigned to the appointment
    appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Who cancelled it (citizen/officer/admin)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL, -- Optional: links to an appointment
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- User who uploaded the document
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL UNIQUE, -- Local path relative to upload directory
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status document_status DEFAULT 'pending_review',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Officer who reviewed it
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT -- Reviewer notes
);

-- Table: feedback
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Optional: Can be anonymous
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL, -- Optional: Links to a specific appointment
    feedback_type feedback_type NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_to BOOLEAN DEFAULT FALSE,
    response TEXT -- Officer/Admin response
);

-- Table: ai_knowledge_base
CREATE TABLE ai_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_pattern TEXT NOT NULL UNIQUE, -- Regex or string match pattern
    answer TEXT NOT NULL,
    tags TEXT[], -- For categorization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add seed data here (example)
-- INSERT INTO departments (name, description) VALUES ('Department of Motor Vehicles', 'Handles vehicle registration and licenses.');
-- INSERT INTO users (email, password_hash, full_name, role) VALUES ('admin@example.com', 'hashed_password_here', 'Admin User', 'admin');
-- INSERT INTO users (email, password_hash, full_name, role, department_id) VALUES ('officer1@dmv.com', 'hashed_password_here', 'Officer One', 'officer', (SELECT id FROM departments WHERE name = 'Department of Motor Vehicles'));
-- INSERT INTO services (department_id, name, duration_minutes) VALUES ((SELECT id FROM departments WHERE name = 'Department of Motor Vehicles'), 'Apply for Driving License', 60);
-- INSERT INTO ai_knowledge_base (question_pattern, answer) VALUES ('how do i apply for a driving license?', 'You need to visit the Department of Motor Vehicles with your identification and required documents. You can book an appointment online.');