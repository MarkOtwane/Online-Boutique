export interface TrackingInfo {
  trackingId: string;
  currentStatus: string;
  statusHistory: Array<{
    status: string;
    location: string;
    notes?: string;
    timestamp: Date;
  }>;
  estimatedDelivery?: Date;
  lastUpdated: Date;
}

export interface CreateTrackingDto {
  orderId: number;
  initialStatus?: string;
  location?: string;
  notes?: string;
}

export interface UpdateTrackingDto {
  status?: string;
  location?: string;
  notes?: string;
  estimatedDelivery?: Date;
}

export interface TrackingStats {
  total: number;
  byStatus: Record<string, number>;
}