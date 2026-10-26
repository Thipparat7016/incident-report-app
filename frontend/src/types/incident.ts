export type IncidentCategory = 'Safety' | 'Maintenance';

export type IncidentStatus = 'Open' | 'In Progress' | 'Success';

export interface Incident {
  id: number;
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
  created_at: string;
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  category: IncidentCategory;
  status?: IncidentStatus;
}

export interface UpdateIncidentPayload {
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
}

export interface IncidentStats {
  total: number;
  open: number;
  in_progress: number;
  success: number;
}
