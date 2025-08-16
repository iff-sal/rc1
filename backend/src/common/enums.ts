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
  NationalIdentityCard = 'national_identity_card',
  Passport = 'passport',
  DrivingLicense = 'driving_license',
  BirthCertificate = 'birth_certificate',
  ApplicationForm = 'application_form',
  Photograph = 'photograph',
  Other = 'other',
}

export enum DocumentStatus {
  Uploaded = 'uploaded',
  UnderReview = 'under_review',
  Approved = 'approved',
  Rejected = 'rejected',
}
