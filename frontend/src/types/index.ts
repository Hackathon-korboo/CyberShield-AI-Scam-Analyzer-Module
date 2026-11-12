export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Unknown';

export interface ProviderResult {
  provider: string;
  indicator_type: string;
  indicator_value: string;
  status: string;
  matched: boolean;
  verified: boolean;
  reference?: string | null;
  details?: Record<string, any> | null;
  first_seen?: string | null;
  last_seen?: string | null;
}

export interface RiskReport {
  report_id: string;
  summary: string;
  evidence: string[];
  recommendations: string[];
  report_hash: string;
  verification_status: string;
  blockchain_tx?: string | null;
  created_at: string;
}

export interface ScanEvent {
  event_type: string;
  description: string;
  created_at: string;
}

export interface MessageIndicator {
  category: string;
  severity: string;
  description: string;
}

export interface ScanDetail {
  scan_id: string;
  scan_type: 'url' | 'domain' | 'message' | 'qr' | 'email';
  target: string;
  normalized_target?: string | null;
  domain?: string | null;
  hostname?: string | null;
  status: string;
  risk_level: RiskLevel;
  risk_score: number;
  created_at: string;
  providers_checked: ProviderResult[];
  report: RiskReport;
  events: ScanEvent[];
  message_indicators?: MessageIndicator[];
  analysis_engine?: string;
}

export interface ScanListItem {
  id: string;
  scan_type: string;
  target: string;
  status: string;
  risk_level: RiskLevel;
  risk_score: number;
  created_at: string;
  report_hash?: string | null;
  verification_status?: string | null;
}

export interface ScanListResponse {
  total: number;
  items: ScanListItem[];
}

export interface VerifyReportResponse {
  report_id: string;
  stored_hash: string;
  recalculated_hash: string;
  is_valid: boolean;
  verification_status: string;
  audit_notes: string;
  blockchain_verified: boolean;
  blockchain_tx?: string | null;
}

export interface ProviderStatusItem {
  provider_name: string;
  category: string;
  configured: boolean;
  status: string;
  details: string;
  env_variable: string;
}

export interface SystemStatusResponse {
  status: string;
  database_connected: boolean;
  database_type: string;
  providers: ProviderStatusItem[];
  app_version: string;
  environment: string;
}

export interface StatsOverviewResponse {
  total_scans: number;
  malicious_count: number;
  suspicious_count: number;
  benign_count: number;
  risk_distribution: Record<string, number>;
  recent_scans: ScanListItem[];
}

// =============================================================================
// CyberShield Nexus Innovation Types
// =============================================================================

export interface GraphNode {
  id: string;
  label: string;
  full_value: string;
  type: string;
  risk_level: RiskLevel;
  scan_id?: string | null;
  first_seen?: string | null;
  last_seen?: string | null;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  is_verified: boolean; // true = Solid, false = Dashed
  confidence: number;
  evidence?: string | null;
  detected_at?: string | null;
}

export interface GraphStats {
  total_nodes: number;
  total_edges: number;
  verified_edges: number;
  inferred_edges: number;
  critical_entities: number;
}

export interface ThreatGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: GraphStats;
}

export interface ChecklistItem {
  step_number: number;
  title: string;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'FOLLOW_UP';
  description: string;
  action_type: 'CALL' | 'VISIT_URL' | 'DEVICE_SETTING' | 'BANK_ACTION' | 'DOCUMENTATION';
  action_target?: string | null;
  verified_channel?: string | null;
  evidence_tips?: string | null;
}

export interface HelplineItem {
  name: string;
  contact: string;
  type: string;
  hours: string;
  jurisdiction: string;
  official_url: string;
}

export interface GoldenHourPlan {
  scenario_title: string;
  severity_assessment: string;
  golden_hour_active: boolean;
  golden_hour_warning: string;
  official_helplines: HelplineItem[];
  immediate_checklist: ChecklistItem[];
  evidence_preservation_guide: string[];
  disclaimer: string;
}

export interface UPIPayloadDetails {
  payee_vpa?: string | null;
  payee_name?: string | null;
  amount?: string | null;
  currency?: string;
  transaction_note?: string | null;
  transaction_ref?: string | null;
  merchant_code?: string | null;
  raw_query: Record<string, string>;
}

export interface QRAnalysisResult {
  payload_type: string;
  raw_payload: string;
  decoded_summary: string;
  risk_level: RiskLevel;
  risk_score: number;
  upi_details?: UPIPayloadDetails | null;
  warning_signals: string[];
  recommendations: string[];
  evidence: string[];
  safe_to_proceed: boolean;
  requires_precaution: boolean;
}

export interface EmailHeaderFields {
  from_header?: string | null;
  from_email?: string | null;
  from_domain?: string | null;
  reply_to?: string | null;
  reply_to_email?: string | null;
  reply_to_domain?: string | null;
  return_path?: string | null;
  return_path_domain?: string | null;
  subject?: string | null;
  message_id?: string | null;
  raw_auth_results?: string | null;
  received_spf?: string | null;
  has_dkim_signature: boolean;
}

export interface EmailAuthenticationResult {
  has_headers: boolean;
  headers: EmailHeaderFields;
  spf_status: string;
  spf_record?: string | null;
  dkim_status: string;
  dmarc_status: string;
  dmarc_policy?: string | null;
  dmarc_record?: string | null;
  alignment_verified: boolean;
  warning_signals: string[];
  evidence: string[];
  risk_level: RiskLevel;
  risk_score: number;
  recommendations: string[];
  plain_english_explanation: string;
}

export interface RDAPMetadata {
  domain: string;
  status: string;
  creation_date?: string | null;
  expiration_date?: string | null;
  updated_date?: string | null;
  registrar?: string | null;
  nameservers: string[];
  age_days?: number | null;
  is_newly_registered: boolean;
}

export interface CertificateTransparencyAudit {
  domain: string;
  status: string;
  certificate_count: number;
  issuers: string[];
  observed_subdomains: string[];
  first_seen?: string | null;
  last_seen?: string | null;
}

export interface BrandFinding {
  brand_name: string;
  impersonation_type: string;
  suspect_token: string;
  official_domain: string;
  confidence: number;
  description: string;
}

export interface DomainIntelligenceResult {
  domain: string;
  rdap: RDAPMetadata;
  certificate_transparency: CertificateTransparencyAudit;
  brand_findings: BrandFinding[];
  risk_level: RiskLevel;
  risk_score: number;
  warning_signals: string[];
  evidence: string[];
  recommendations: string[];
}

export interface HeaderFinding {
  header_name: string;
  observed_value?: string | null;
  status: 'ENFORCED' | 'WEAK' | 'MISSING';
  expected_value: string;
  severity: string;
  security_impact: string;
  remediation_guidance: string;
}

export interface SecurityPostureAssessment {
  target_url: string;
  posture_score: number;
  posture_grade: string;
  enforced_controls_count: number;
  missing_controls_count: number;
  findings: HeaderFinding[];
  cookie_hygiene: Record<string, boolean>;
  summary: string;
}

export interface CommunityIndicatorItem {
  id: string;
  indicator_type: string;
  indicator_value: string;
  category: string;
  severity: string;
  reporter_notes?: string | null;
  source_scan_id?: string | null;
  upvotes: number;
  submitted_at: string;
}

export interface CommunityFeedResponse {
  total: number;
  indicators: CommunityIndicatorItem[];
  policy_notice: string;
}

