export type ThreatSeverity = 'critical'|'high'|'medium'|'low';
export type ThreatStatus = 'active'|'mitigated'|'investigating';
export interface Threat { id:string; name:string; source:string; severity:ThreatSeverity; status:ThreatStatus; timestamp:Date; description?:string; }
export interface LogEntry { id:string; timestamp:Date; level:'critical'|'warn'|'ok'|'info'; message:string; }
export interface SystemMetric { label:string; value:number; unit?:string; delta?:number; color:'cyan'|'red'|'violet'|'amber'|'green'; }
export interface DefenseCoverage { label:string; percentage:number; color:'cyan'|'red'|'violet'|'amber'|'green'; }
export interface NetworkNode { id:string; x:number; y:number; type:'threat'|'node'|'gateway'; }
export type NavRoute = { label:string; href:string; icon:string; badge?:number; section:'monitor'|'analyze'|'system'; };
