import { z } from 'zod'

const VALID_ORGS = [
  'ufc','bellator','pfl','one_fc','other_mma',
  'ibjjf','adcc','naga','other_bjj',
  'ncaa','nfhs','usaw','uww','other_wrestling',
  'npc','ifbb','other_bodybuilding',
] as const

export const competitionSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  discipline: z.enum(['mma','bjj','wrestling','bodybuilding']),
  organization: z.string().refine(
    v => VALID_ORGS.includes(v as any),
    { message: 'Invalid organization' }
  ),
  weighin_type: z.enum(['day_before','same_day','two_hour_window','certified_minimum']),
  competition_date: z.string().date(),
  weighin_date: z.string().date(),
  target_weight_lbs: z.number().positive().max(500),
  starting_weight_lbs: z.number().positive().max(500),
  weight_class_name: z.string().max(100).optional(),
  gi_weight_lbs: z.number().positive().max(10).optional(),
  jurisdiction: z.string().max(50).optional(),
  ncaa_certified_minimum: z.number().positive().max(500).optional(),
  division: z.string().max(100).optional(),
})

export const checkinSchema = z.object({
  checkin_date: z.string().date(),
  morning_weight_lbs: z.number().positive().max(500).optional(),
  evening_weight_lbs: z.number().positive().max(500).optional(),
  calories_consumed: z.number().int().min(0).max(10000).optional(),
  protein_g: z.number().min(0).max(1000).optional(),
  carbs_g: z.number().min(0).max(1000).optional(),
  fat_g: z.number().min(0).max(500).optional(),
  water_intake_oz: z.number().min(0).max(500).optional(),
  sodium_mg: z.number().int().min(0).max(20000).optional(),
  energy_level: z.number().int().min(1).max(10).optional(),
  sleep_hours: z.number().min(0).max(24).optional(),
  sleep_quality: z.number().int().min(1).max(10).optional(),
  training_intensity: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(2000).optional(),
})

export const profileSchema = z.object({
  full_name: z.string().min(1).max(200).trim(),
  gender: z.enum(['male', 'female']).optional(),
  date_of_birth: z.string().date().optional(),
  height_inches: z.number().positive().max(96).optional(),
  timezone: z.string().max(50).optional(),
})
