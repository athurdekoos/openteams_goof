import { ColumnSchema } from '../types';

export const RECORD_COLUMNS: ColumnSchema[] = [
  { name: 'ID', type: 'number', width: 60 },
  { name: 'Name', type: 'string', width: 160 },
  { name: 'Company', type: 'string', width: 180 },
  { name: 'Email', type: 'email', width: 220 },
  { name: 'Status', type: 'status', width: 90 },
  { name: 'Category', type: 'category', width: 110 },
  { name: 'Price', type: 'number', width: 100 },
  { name: 'Date', type: 'date', width: 110 },
  { name: 'Avatar', type: 'image', width: 50 },
  { name: 'Website', type: 'url', width: 220 },
];

export const EDITABLE_COLUMNS: ColumnSchema[] = [
  { name: 'ID', type: 'number', width: 60, editable: false },
  { name: 'First Name', type: 'string', width: 120, editable: true,
    validator: (v: string) => v.trim().length > 0 },
  { name: 'Last Name', type: 'string', width: 120, editable: true,
    validator: (v: string) => v.trim().length > 0 },
  { name: 'Email', type: 'email', width: 200, editable: true,
    validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
  { name: 'Age', type: 'number', width: 60, editable: true,
    validator: (v: string) => { const n = Number(v); return !isNaN(n) && n >= 0 && n <= 150; } },
  { name: 'Salary', type: 'number', width: 100, editable: true,
    validator: (v: string) => { const n = Number(v); return !isNaN(n) && n >= 0; } },
  { name: 'Department', type: 'string', width: 120, editable: true },
  { name: 'Start Date', type: 'date', width: 110, editable: true,
    validator: (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) },
  { name: 'Status', type: 'status', width: 90, editable: true },
  { name: 'Notes', type: 'string', width: 200, editable: true },
];
