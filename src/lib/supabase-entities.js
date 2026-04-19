/**
 * Supabase Compatibility Layer
 * 
 * This module provides a drop-in replacement for the `base44.entities` API,
 * backed by Supabase. It maps the Base44 entity names to Supabase table names
 * (snake_case) and translates the Base44 query syntax to Supabase queries.
 * 
 * Usage: import { db } from '@/lib/supabase-entities';
 *         db.Lead.list('-created_date', 100)
 *         db.Lead.filter({ status: 'new' }, '-created_date', 50)
 *         db.Lead.create({ full_name: 'John' })
 *         db.Lead.update(id, { status: 'qualified' })
 *         db.Lead.delete(id)
 *         db.Lead.subscribe(callback)
 */

import { supabase } from '@/integrations/supabase/client';

// ── Entity name → Supabase table name mapping ──────────────────────────
const ENTITY_TABLE_MAP = {
  Lead: 'leads',
  Inquiry: 'inquiries',
  User: 'users',
  UserActivity: 'user_activities',
  UserProfile: 'user_profiles',
  ClientProject: 'client_projects',
  ClientMilestone: 'client_milestones',
  ClientFile: 'client_files',
  OnboardingTask: 'onboarding_tasks',
  OnboardingProgress: 'onboarding_progress',
  ProjectTask: 'project_tasks',
  TimeLog: 'time_logs',
  DeliverableApproval: 'deliverable_approvals',
  ClientFeedback: 'client_feedback',
  DashboardPreference: 'dashboard_preferences',
  ClientNotification: 'client_notifications',
  ClientMessage: 'client_messages',
  ClientReportSubscription: 'client_report_subscriptions',
  Booking: 'bookings',
  Activity: 'activities',
  AI_Assessment: 'ai_assessments',
  BlogPost: 'blog_posts',
  BlogComment: 'blog_comments',
  CMS_Page: 'cms_pages',
  Testimonial: 'testimonials',
  ClientLogo: 'client_logos',
  ServicePackage: 'service_packages',
  ServiceAddon: 'service_addons',
  Pricing_Plan: 'pricing_plans',
  Campaign: 'campaigns',
  Payment: 'payments',
  Contract: 'contracts',
  Proposal: 'proposals',
  Invoice: 'invoices',
  EmployeeAgreement: 'employee_agreements',
  OfferLetter: 'offer_letters',
  DocumentTemplate: 'document_templates',
  ProjectTemplate: 'project_templates',
  CRMSyncConfig: 'crm_sync_configs',
  EmailTemplate: 'email_templates',
  EmailSequence: 'email_sequences',
  EmailAnalytics: 'email_analytics',
  SharedDocument: 'shared_documents',
  TaskComment: 'task_comments',
  ResourceAllocation: 'resource_allocations',
};

// ── Parse Base44 sort syntax ───────────────────────────────────────────
// Base44 sort: "-created_date" → descending, "created_date" → ascending
// Supabase: { column: 'created_date', ascending: false }
function parseSort(sortStr) {
  if (!sortStr) return null;
  const desc = sortStr.startsWith('-');
  const column = desc ? sortStr.slice(1) : sortStr;
  // Convert camelCase column names to snake_case for Supabase
  const snakeColumn = column.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
  return { column: snakeColumn, ascending: !desc };
}

// ── Convert camelCase keys to snake_case ────────────────────────────────
function toSnakeCase(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
      result[snakeKey] = toSnakeCase(value);
    }
    return result;
  }
  return obj;
}

// ── Convert snake_case keys to camelCase ────────────────────────────────
function toCamelCase(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      result[camelKey] = toCamelCase(value);
    }
    return result;
  }
  return obj;
}

// ── Create an Entity class for a given table ────────────────────────────
class SupabaseEntity {
  constructor(entityName) {
    this.entityName = entityName;
    this.tableName = ENTITY_TABLE_MAP[entityName] || entityName;
  }

  /**
   * List all records with optional sort and limit
   * @param {string} sortStr - Sort string e.g. "-created_date"
   * @param {number} limit - Max records to return
   * @returns {Promise<Array>}
   */
    let query = supabase.from(this.tableName).select('*');
    
    let sort = parseSort(sortStr);
    
    // Sort logic with fallback for created_date
    if (sort) {
      if (sort.column === 'created_date') {
        // Many tables use created_at but code uses created_date
        query = query.order('created_at', { ascending: sort.ascending });
      } else {
        query = query.order(sort.column, { ascending: sort.ascending });
      }
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error(`[SupabaseEntity] list error for ${this.tableName}:`, error);
      throw error;
    }
    
    return (data || []).map(row => {
      const camel = toCamelCase(row);
      // Ensure created_date exists if created_at is present
      if (row.created_at && !camel.createdDate) {
        camel.createdDate = row.created_at;
      }
      return camel;
    });

  /**
   * Filter records by query object
   * @param {Object} filters - Key-value pairs to filter by
   * @param {string} sortStr - Sort string
   * @param {number} limit - Max records
   * @returns {Promise<Array>}
   */
  async filter(filters, sortStr, limit) {
    let query = supabase.from(this.tableName).select('*');
    
    // Apply filters (convert filter keys to snake_case)
    if (filters && typeof filters === 'object') {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          const snakeKey = key.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
          query = query.eq(snakeKey, value);
        }
      }
    }
    
    const sort = parseSort(sortStr);
    if (sort) {
      query = query.order(sort.column, { ascending: sort.ascending });
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error(`[SupabaseEntity] filter error for ${this.tableName}:`, error);
      throw error;
    }
    
    return (data || []).map(row => toCamelCase(row));
  }

  /**
   * Get a single record by ID
   * @param {string} id - Record UUID
   * @returns {Promise<Object>}
   */
  async get(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`[SupabaseEntity] get error for ${this.tableName}:`, error);
      throw error;
    }
    
    return toCamelCase(data);
  }

  /**
   * Create a new record
   * @param {Object} data - Record data (camelCase keys will be converted to snake_case)
   * @returns {Promise<Object>}
   */
  async create(data) {
    const snakeData = toSnakeCase(data);
    
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(snakeData)
      .select()
      .single();
    
    if (error) {
      console.error(`[SupabaseEntity] create error for ${this.tableName}:`, error);
      throw error;
    }
    
    return toCamelCase(result);
  }

  /**
   * Update a record by ID
   * @param {string} id - Record UUID
   * @param {Object} data - Updated fields
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const snakeData = toSnakeCase(data);
    
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(snakeData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`[SupabaseEntity] update error for ${this.tableName}:`, error);
      throw error;
    }
    
    return toCamelCase(result);
  }

  /**
   * Delete a record by ID
   * @param {string} id - Record UUID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`[SupabaseEntity] delete error for ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time changes on this table
   * @param {Function} callback - Called with { type, data }
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    const channel = supabase
      .channel(`${this.tableName}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: this.tableName },
        (payload) => {
          const eventType = payload.eventType === 'INSERT' ? 'create' :
                           payload.eventType === 'UPDATE' ? 'update' :
                           payload.eventType === 'DELETE' ? 'delete' : payload.eventType;
          callback({
            type: eventType,
            data: toCamelCase(payload.new || payload.old),
          });
        }
      )
      .subscribe();
    
    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}

// ── Build the db object with all entities ───────────────────────────────
const db = {};
for (const entityName of Object.keys(ENTITY_TABLE_MAP)) {
  db[entityName] = new SupabaseEntity(entityName);
}

export { db, SupabaseEntity, ENTITY_TABLE_MAP };
