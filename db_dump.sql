-- OneGovSL Database Schema
--
-- PostgreSQL database dump
--

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('citizen', 'government_officer', 'admin');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled'); -- Simplified for initial phase
CREATE TYPE document_type AS ENUM ('nic', 'passport', 'driving_license', 'other'); -- Not used in provided schema, but good to have
CREATE TYPE document_status AS ENUM ('pending_review', 'approved', 'rejected');
-- feedback_type enum from previous code not used in provided schema, removing for consistency

-- Create Tables

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255), -- Changed to not NULL in provided schema, adjusting
    nic VARCHAR(20) UNIQUE, -- National Identity Card, optional
    phone_number VARCHAR(20), -- optional
    address TEXT, -- optional
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
    contact_email VARCHAR(255), -- Optional based on provided schema
    contact_phone VARCHAR(20), -- Optional based on provided schema
    address TEXT, -- Optional based on provided schema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: services
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE, -- Changed to NOT NULL based on provided schema
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255), -- Added category based on previous discussion
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (department_id, name) -- Service names should be unique per department
);

-- Table: appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Citizen booking the appointment, Changed to NOT NULL based on provided schema
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE, -- Changed to NOT NULL based on provided schema
    officer_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Officer assigned to the appointment, Optional
    appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE, -- Optional
    cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Who cancelled it (citizen/officer/admin), Optional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User who uploaded the document, Changed to NOT NULL
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL, -- Optional: links to an appointment
    file_path VARCHAR(255) NOT NULL, -- Local path relative to upload directory, UNIQUE constraint from previous code removed as not in provided schema
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50), -- Optional
    file_size_bytes BIGINT, -- Optional
    document_type document_type, -- Added based on previous discussion, Optional
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status document_status DEFAULT 'pending_review',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Officer who reviewed it, Optional
    reviewed_at TIMESTAMP WITH TIME ZONE, -- Optional
    notes TEXT -- Reviewer notes, Optional
);

-- Table: feedback
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Optional: Can be anonymous
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL, -- Optional: Links to a specific appointment
    -- feedback_type feedback_type NOT NULL, -- feedback_type from previous code not in provided schema, removing
    subject VARCHAR(255), -- Optional
    message TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_to BOOLEAN DEFAULT FALSE, -- Optional
    response TEXT -- Officer/Admin response, Optional
);

-- Table: ai_knowledge_base
CREATE TABLE ai_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_keywords TEXT[] NOT NULL, -- Changed from question_pattern (TEXT) based on previous discussion
    response_text TEXT NOT NULL, -- Changed from answer (TEXT) based on previous discussion
    service_id UUID REFERENCES services(id) ON DELETE SET NULL, -- Optional link to a service, Added based on previous discussion
    tags TEXT[], -- For categorization, Optional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_nic ON users(nic);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_services_department_id ON services(department_id);
CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_officer_id ON appointments(officer_id);
CREATE INDEX idx_appointments_appointment_time ON appointments(appointment_time);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_appointment_id ON documents(appointment_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_appointment_id ON feedback(appointment_id);
CREATE INDEX idx_ai_kb_query_keywords ON ai_knowledge_base USING GIN(query_keywords);


-- Seed Data

-- Departments
INSERT INTO departments (id, name, description) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Department of Motor Traffic', 'Handles vehicle registration, licensing, and related services.'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Department of Immigration & Emigration', 'Manages passports, visas, and immigration matters.'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ministry of Health', 'Oversees public health services and regulations.');

-- Services
INSERT INTO services (department_id, name, description, category, duration_minutes) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Driving License Renewal', 'Process for renewing an expired driving license.', 'Transport', 30),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Vehicle Registration', 'Registering a new or imported vehicle.', 'Transport', 45),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'New Passport Application', 'Applying for a new Sri Lankan passport.', 'NIC and Documents', 60),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Visa Extension', 'Requesting an extension for a stay visa.', 'NIC and Documents', 40),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Specialist Doctor Appointment (OPD)', 'Booking an appointment with a hospital specialist.', 'Health Services', 15),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Public Health Inspector Consultation', 'Consultation services from a PHI.', 'Health Services', 20); -- Corrected typo


-- Users (Passwords are bcrypt hashed - Replace [BCRYPT_HASH_FOR_PASSWORD123] with the actual hash)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('citizen@example.com', '[BCRYPT_HASH_FOR_PASSWORD123]', 'Citizen User', 'citizen'); -- Added full_name as per provided schema

INSERT INTO users (email, password_hash, full_name, role, department_id) VALUES
('officer@example.com', '[BCRYPT_HASH_FOR_PASSWORD123]', 'Government Officer', 'government_officer', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'); -- Added full_name and linked to Motor Traffic Department


-- AI Knowledge Base
INSERT INTO ai_knowledge_base (query_keywords, response_text, service_id) VALUES
('{"driving license", "renew", "renewal"}', 'To renew your driving license, please book an appointment with the Department of Motor Traffic for the "Driving License Renewal" service.', (SELECT id FROM services WHERE name = 'Driving License Renewal')),
('{"passport", "apply", "application"}', 'For a new passport application, please schedule an appointment with the Department of Immigration & Emigration for the "New Passport Application" service.', (SELECT id FROM services WHERE name = 'New Passport Application')),
('{"OPD", "specialist", "doctor", "hospital"}', 'You can book an appointment with a specialist doctor at a hospital via the Ministry of Health services.', (SELECT id FROM services WHERE name = 'Specialist Doctor Appointment (OPD)'));