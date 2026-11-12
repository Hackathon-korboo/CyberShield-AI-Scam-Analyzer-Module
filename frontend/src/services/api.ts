import axios from 'axios';
import {
  ScanDetail,
  ScanListResponse,
  VerifyReportResponse,
  SystemStatusResponse,
  StatsOverviewResponse,
  RiskReport,
  ThreatGraphResponse,
  GoldenHourPlan,
  QRAnalysisResult,
  EmailAuthenticationResult,
  DomainIntelligenceResult,
  SecurityPostureAssessment,
  CommunityIndicatorItem,
  CommunityFeedResponse
} from '../types';

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || '/api/v1';

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const scanUrl = async (url: string): Promise<ScanDetail> => {
  const response = await api.post<ScanDetail>('/scans/url', { url });
  return response.data;
};

export const scanMessage = async (content: string): Promise<ScanDetail> => {
  const response = await api.post<ScanDetail>('/scans/message', { content });
  return response.data;
};

export const scanQRMaster = async (payload: string): Promise<ScanDetail> => {
  const response = await api.post<ScanDetail>('/scans/qr', { payload });
  return response.data;
};

export const scanEmailMaster = async (content: string): Promise<ScanDetail> => {
  const response = await api.post<ScanDetail>('/scans/email', { content });
  return response.data;
};

export const getScans = async (params?: {
  query?: string;
  risk_level?: string;
  scan_type?: string;
  limit?: number;
  offset?: number;
}): Promise<ScanListResponse> => {
  const response = await api.get<ScanListResponse>('/scans', { params });
  return response.data;
};

export const getScanById = async (scanId: string): Promise<ScanDetail> => {
  const response = await api.get<ScanDetail>(`/scans/${scanId}`);
  return response.data;
};

export const getReportById = async (reportId: string): Promise<RiskReport> => {
  const response = await api.get<RiskReport>(`/reports/${reportId}`);
  return response.data;
};

export const verifyReport = async (
  reportId: string,
  simulatedTamperedSummary?: string
): Promise<VerifyReportResponse> => {
  const response = await api.post<VerifyReportResponse>(`/reports/${reportId}/verify`, {
    simulated_tampered_summary: simulatedTamperedSummary,
  });
  return response.data;
};

export const getSystemStatus = async (): Promise<SystemStatusResponse> => {
  const response = await api.get<SystemStatusResponse>('/system/status');
  return response.data;
};

export const getStats = async (): Promise<StatsOverviewResponse> => {
  const response = await api.get<StatsOverviewResponse>('/stats');
  return response.data;
};

// =============================================================================
// CyberShield Nexus Innovation Services
// =============================================================================

export const getThreatGraph = async (params?: {
  entity_id?: string;
  scan_id?: string;
  hops?: number;
  entity_type?: string[];
}): Promise<ThreatGraphResponse> => {
  const response = await api.get<ThreatGraphResponse>('/nexus/graph', { params });
  return response.data;
};

export const getGoldenHourScenarios = async (): Promise<any> => {
  const response = await api.get('/nexus/golden-hour/scenarios');
  return response.data;
};

export const generateGoldenHourPlan = async (payload: {
  scenario_type: string;
  time_elapsed: string;
  money_transferred?: boolean;
  amount_transferred?: string;
  transaction_id_or_utr?: string;
  bank_or_app_name?: string;
  credentials_entered?: boolean;
  account_or_service?: string;
  app_installed?: boolean;
  installed_app_name?: string;
  device_accessible?: boolean;
}): Promise<GoldenHourPlan> => {
  const response = await api.post<GoldenHourPlan>('/nexus/golden-hour/generate', payload);
  return response.data;
};

export const analyzeQR = async (payload: string): Promise<QRAnalysisResult> => {
  const response = await api.post<QRAnalysisResult>('/nexus/qr/analyze', { payload });
  return response.data;
};

export const authenticateEmail = async (content: string): Promise<EmailAuthenticationResult> => {
  const response = await api.post<EmailAuthenticationResult>('/nexus/email/authenticate', { content });
  return response.data;
};

export const investigateDomainIntel = async (domain: string): Promise<DomainIntelligenceResult> => {
  const response = await api.post<DomainIntelligenceResult>('/nexus/domain/intel', { domain });
  return response.data;
};

export const assessSecurityPosture = async (url: string, headers?: Record<string, string>): Promise<SecurityPostureAssessment> => {
  const response = await api.post<SecurityPostureAssessment>('/nexus/security-posture/assess', { url, headers });
  return response.data;
};

export const submitCommunityIndicator = async (payload: {
  indicator_type: string;
  indicator_value: string;
  category: string;
  severity?: string;
  reporter_notes?: string;
  source_scan_id?: string;
  user_consent: boolean;
}): Promise<CommunityIndicatorItem> => {
  const response = await api.post<CommunityIndicatorItem>('/nexus/community/submit', payload);
  return response.data;
};

export const getCommunityFeed = async (params?: {
  category?: string;
  indicator_type?: string;
  limit?: number;
}): Promise<CommunityFeedResponse> => {
  const response = await api.get<CommunityFeedResponse>('/nexus/community/feed', { params });
  return response.data;
};

export interface SessionSyncData {
  session_id: string;
  status: 'waiting' | 'ready' | 'expired';
  payload?: string | null;
  source_device?: string | null;
  created_at: number;
  updated_at: number;
}

export const publishSessionSync = async (data: {
  session_id: string;
  payload: string;
  source_device?: string;
  image_preview?: string;
}): Promise<SessionSyncData> => {
  const response = await api.post<SessionSyncData>('/session/sync', data);
  return response.data;
};

export const getSessionSyncStatus = async (sessionId: string): Promise<SessionSyncData> => {
  const response = await api.get<SessionSyncData>(`/session/sync/${sessionId}`);
  return response.data;
};

export default api;
