export enum UserRole {
  Citizen = 'citizen',
  GovernmentOfficer = 'government_officer',
  Admin = 'admin',
}

export enum AppointmentStatus {
  Scheduled = 'scheduled',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum DocumentType {
  NIC = 'nic',
  Passport = 'passport',
  DrivingLicense = 'driving_license',
  Other = 'other',
}

export enum DocumentStatus {
  PendingReview = 'pending_review',
  Approved = 'approved',
  Rejected = 'rejected',
}