import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function generateAppNumber(): string {
  const digits = Math.floor(100000 + Math.random() * 900000).toString()
  return `APP-NEP-2025-${digits}`
}

export function generateTransactionId(): string {
  const year = new Date().getFullYear()
  const digits = Math.floor(100000 + Math.random() * 900000).toString()
  return `TX-NEP-${year}-${digits}`
}

export function maskAccountNumber(account: string): string {
  if (!account || account.length < 4) return '****'
  return '****' + account.slice(-4)
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    disbursed: 'Disbursed',
  }
  return labels[status] || status
}

export function getGrantProgramLabel(program: string): string {
  const labels: Record<string, string> = {
    emergency_assistance: 'Emergency Assistance',
    education_support: 'Education Support',
    medical_expenses: 'Medical Expenses',
    community_development: 'Community Development',
    business_funding: 'Business Funding',
    other: 'Other',
  }
  return labels[program] || program
}

export function getGrantRange(program: string): string {
  const ranges: Record<string, string> = {
    emergency_assistance: '$5,000 – $10,000',
    education_support: '$8,000 – $15,000',
    medical_expenses: '$10,000 – $25,000',
    community_development: '$15,000 – $25,000',
    business_funding: '$5,000 – $50,000',
    other: 'Custom Amount',
  }
  return ranges[program] || 'Varies'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
