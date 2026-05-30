import { supabaseAdmin } from '@/lib/supabase/admin'
export async function logAudit(params: {
  userId: string; action: string; entityType: string;
  entityId?: string; details?: Record<string, unknown>;
  ipAddress?: string; userAgent?: string;
}) {
  await supabaseAdmin.from('audit_log').insert({
    user_id: params.userId, action: params.action,
    entity_type: params.entityType, entity_id: params.entityId,
    details: params.details ?? {},
    ip_address: params.ipAddress, user_agent: params.userAgent,
  })
}
