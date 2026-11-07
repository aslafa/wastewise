export type WasteCategory = 'Organik' | 'Anorganik' | 'B3'

// Enum status penjemputan resmi sesuai PostgreSQL enum pickup_status di Supabase
export type DbPickupStatus =
  | 'draft'
  | 'pending'
  | 'assigned'
  | 'on_the_way'
  | 'arrived'
  | 'verified'
  | 'completed'
  | 'cancelled'

// Legacy / alias compatibility
export type PickupStatus = DbPickupStatus | 'accepted'

export type UserRole = 'warga' | 'petugas' | 'admin' | 'super_admin' | 'mitra'

export interface UserAddress {
  id: string
  user_id: string
  label: string
  recipient_name: string
  phone: string
  full_address: string
  kelurahan?: string | null
  kecamatan?: string | null
  city: string
  postal_code?: string | null
  latitude?: number | null
  longitude?: number | null
  is_primary: boolean
  created_at?: string
}

export interface DbPickupItem {
  id?: string
  pickup_id?: string
  category_id: string
  classification_id?: string | null
  estimated_kg: number
  item_description?: string | null
  category?: DbWasteCategory
}

export interface DbPickupRequest {
  id: string
  request_number: string
  user_id: string
  address_id: string
  scheduled_date: string
  time_slot: string
  notes?: string | null
  status: DbPickupStatus
  total_estimated_kg: number
  total_verified_kg: number
  partner_id?: string | null
  created_at: string
  updated_at: string
  user_profile?: UserProfile
  address?: UserAddress
  items?: DbPickupItem[]
  assigned_officer_name?: string | null
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone?: string | null
  avatar_url?: string | null
  points_balance: number
  customer_qr_token?: string | null
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval'
  partner_id?: string | null
  created_at: string
}

export interface DbReward {
  id: string
  title: string
  description: string | null
  reward_type: 'diskon_jasa' | 'voucher_belanja' | 'donasi_pohon' | 'uang_tunai'
  points_required: number
  stock_quantity: number
  is_active: boolean
  valid_until?: string | null
  created_at?: string
}

export interface DbRewardRedemption {
  id: string
  redemption_code: string
  user_id: string
  reward_id: string
  points_spent: number
  status: 'issued' | 'claimed' | 'expired' | 'cancelled'
  claimed_at?: string | null
  created_at: string
  reward?: DbReward
}

export interface Pickup {
  id: string
  created_at: string
  user_id: string
  user_name: string
  user_email: string
  address: string
  scheduled_date: string
  category: WasteCategory
  status: PickupStatus
  weight_kg?: number
  image_url?: string
  ai_confidence: number
  driver_id?: string
  driver_name?: string
  notes?: string
  economic_value_idr?: number
}

export interface DbWasteSubcategory {
  id: string
  category_id: string
  code: string
  name: string
  description: string | null
  potential_processing_method: string
  typical_economic_value_per_kg: number
  is_active: boolean
  created_at?: string
}

export interface AIClassificationLog {
  id: string
  created_at: string
  user_name: string
  image_url: string
  predicted_category: WasteCategory
  confidence_score: number
  raw_output_index: string
  is_verified_by_officer: boolean
  is_corrected?: boolean
  corrected_category?: WasteCategory
  selected_subcategory?: string
  subcategory_code?: string
  officer_notes?: string
  ground_truth_label?: string
}

export interface AIModelEvaluationMetrics {
  totalEvaluated: number
  hasEnoughData: boolean
  accuracyPct: number
  precisionPct: number
  recallPct: number
  f1ScorePct: number
  confusionMatrix: {
    classes: WasteCategory[]
    matrix: Record<WasteCategory, Record<WasteCategory, number>>
  }
}

export interface WasteCategoryMetric {
  category: WasteCategory
  total_weight_kg: number
  pickup_count: number
  economic_value_idr: number
  percentage: number
  color: string
}

export interface UserAccount {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'inactive' | 'suspended'
  total_points: number
  pickups_count: number
  joined_at: string
}

export interface MonthlyCollectionTrend {
  month: string
  Organik: number
  Anorganik: number
  B3: number
  total: number
}

export interface DashboardOverviewStats {
  totalWasteKg: number
  totalWasteGrowthPercentage: number
  totalPickups: number
  pendingPickups: number
  registeredUsers: number
  activeOfficers: number
  aiSuccessRatePercentage: number
  economicValueTotalIdr: number
}

export interface DbWasteCategory {
  id: string
  code: string
  name: string
  description: string | null
  is_hazardous: boolean
  allows_auto_points: boolean
  color_hex: string
}

export interface SupabaseConnectionStatus {
  isConfigured: boolean
  isConnected: boolean
  message: string
  categories?: DbWasteCategory[]
  categoriesCount?: number
  error?: string
}


