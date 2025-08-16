export enum UserRole {
  Citizen = 'citizen',
  GovernmentOfficer = 'government_officer',
  Admin = 'admin',
}

export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  CancelledByCitizen = 'cancelled_by_citizen',
  CancelledByOfficer = 'cancelled_by_officer',
  Completed = 'completed',
  Rescheduled = 'rescheduled',
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