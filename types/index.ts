export type ClientType = 'individual' | 'business'

export type ServiceType =
  | 'business_registration'
  | 'notary_mobile'
  | 'notary_home'
  | 'rent_ejectment'
  | 'intellectual_property'
  | 'immigration'
  | 'trademark'
  | 'sri_lankan_documents'

export type SubmissionStatus =
  | 'pending'
  | 'reviewing'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PaymentProvider = 'stripe' | 'paypal'

export type BusinessPackage = 'basic' | 'standard' | 'premium'

export type DocumentType =
  | 'identification'
  | 'legal_document'
  | 'supporting_file'
  | 'generated'

// ── Database row types ──

export interface Client {
  id: string
  client_type: ClientType
  first_name: string
  last_name: string
  email: string
  phone: string
  business_name?: string
  business_type?: string
  ein?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state: string
  zip_code?: string
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  client_id: string
  service_type: ServiceType
  package?: BusinessPackage
  status: SubmissionStatus
  form_data: Record<string, unknown>
  admin_notes?: string
  assigned_to?: string
  submitted_at: string
  updated_at: string
  completed_at?: string
}

export interface Appointment {
  id: string
  submission_id: string
  client_id: string
  service_type: ServiceType
  status: AppointmentStatus
  requested_date: string
  requested_time: string
  confirmed_date?: string
  confirmed_time?: string
  location_address?: string
  location_city?: string
  location_notes?: string
  admin_notes?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
  confirmed_at?: string
}

export interface TimeSlot {
  id: string
  service_type: ServiceType
  slot_date: string
  slot_time: string
  is_available: boolean
  is_blocked: boolean
  max_bookings: number
  current_bookings: number
  created_at: string
}

export interface Document {
  id: string
  submission_id: string
  client_id: string
  document_type: DocumentType
  file_name: string
  file_key: string
  file_url: string
  file_size?: number
  mime_type?: string
  uploaded_by: 'client' | 'admin'
  description?: string
  created_at: string
}

export interface Payment {
  id: string
  submission_id: string
  client_id: string
  provider: PaymentProvider
  status: PaymentStatus
  amount: number
  currency: string
  stripe_session_id?: string
  stripe_payment_intent?: string
  paypal_order_id?: string
  paypal_capture_id?: string
  receipt_url?: string
  refund_reason?: string
  created_at: string
  updated_at: string
  paid_at?: string
  refunded_at?: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  cover_image_url?: string
  meta_title?: string
  meta_description?: string
  keywords?: string[]
  category?: string
  tags?: string[]
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  is_read: boolean
  admin_notes?: string
  created_at: string
}

// ── Form input types (what your forms submit) ──

export interface BusinessFormationInput {
  // Client info
  client_type: ClientType
  first_name: string
  last_name: string
  email: string
  phone: string
  // Business info
  entity_type: 'LLC' | 'Corporation' | 'LLP' | 'GP' | 'Amendment'
  package: BusinessPackage
  business_name_1: string
  business_name_2?: string
  business_name_3?: string
  business_purpose: string
  principal_address: string
  mailing_address?: string
  registered_agent: 'client' | 'third_party'
  owners: OwnerDetail[]
  manager_managed?: 'manager' | 'member'
  number_of_directors?: number
  effective_date?: string
  need_ein?: boolean
  need_operating_agreement?: boolean
  need_initial_resolutions?: boolean
  need_amendment?: boolean
}

export interface OwnerDetail {
  full_name: string
  address: string
  title: string
  ownership_percentage: number
}

export interface NotaryIntakeInput {
  first_name: string
  last_name: string
  email: string
  phone: string
  service_type: 'notary_mobile' | 'notary_home'
  preferred_date: string
  preferred_time_range: 'morning' | 'afternoon' | 'evening'
  signing_address?: string
  number_of_signers: number
  document_type: string
  need_witnesses?: 'yes' | 'no' | 'unsure'
  id_available: string
}

export interface RentLeaseIntakeInput {
  first_name: string
  last_name: string
  email: string
  phone: string
  matter_type:
    | 'residential_lease'
    | 'commercial_lease'
    | 'amendment'
    | 'assignment'
    | 'notice_to_quit'
    | 'ejectment'
  property_address: string
  landlord_info: string
  tenant_info: string
  lease_start_date?: string
  lease_end_date?: string
  monthly_rent?: number
  security_deposit?: number
  reason?: string
}

export interface ImmigrationIntakeInput {
  first_name: string
  last_name: string
  email: string
  phone: string
  preferred_language?: 'english' | 'spanish' | 'sinhala' | 'tamil' | 'other'
  matter_type: string
  country_of_birth: string
  current_us_status?: string
  a_number?: string
  urgency?: 'standard' | 'urgent'
  description: string
}

export interface TrademarkIntakeInput {
  first_name: string
  last_name: string
  business_name?: string
  email: string
  phone: string
  mark_type: 'word_mark' | 'logo' | 'design' | 'slogan'
  mark_wording?: string
  logo_description?: string
  goods_services: string
  use_status: 'in_use' | 'planned_use'
  first_use_date?: string
  geographic_market?: string
}

export interface SriLankanDocsInput {
  first_name: string
  last_name: string
  email: string
  phone: string
  document_type: 'power_of_attorney' | 'will' | 'affidavit' | 'authorization_letter' | 'other'
  document_language: 'english' | 'sinhala' | 'tamil' | 'bilingual'
  country_of_residence: string
  recipient_in_sri_lanka?: string
  asset_details?: string
  special_instructions?: string
}

// ── Admin view types (joined queries) ──

export interface SubmissionFull extends Submission {
  client: Client
  payment?: Payment
  appointment?: Appointment
  documents?: Document[]
}

export interface AdminDashboardStats {
  pending_submissions: number
  pending_appointments: number
  unread_messages: number
  pending_payments: number
}