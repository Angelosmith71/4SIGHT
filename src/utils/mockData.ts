import type { Threat, LogEntry, NetworkNode, SystemMetric, DefenseCoverage } from '@/types';
export const MOCK_THREATS: Threat[] = [
  { id:'t1', name:'SQL Injection Attempt', source:'192.168.4.21', severity:'critical', status:'active', timestamp:new Date(Date.now()-2*60000), description:'Repeated injection payloads targeting db-api-03' },
  { id:'t2', name:'DDoS Spike Detected', source:'External', severity:'critical', status:'active', timestamp:new Date(Date.now()-4*60000), description:'14k req/s spike on edge-01' },
  { id:'t3', name:'Port Scan Activity', source:'10.0.0.88', severity:'high', status:'investigating', timestamp:new Date(Date.now()-12*60000) },
  { id:'t4', name:'Anomaly: Auth Pattern', source:'svc_deploy', severity:'medium', status:'investigating', timestamp:new Date(Date.now()-18*60000) },
  { id:'t5', name:'Lateral Movement', source:'10.0.0.14', severity:'high', status:'investigating', timestamp:new Date(Date.now()-35*60000) },
  { id:'t6', name:'Suspicious DNS Query', source:'host-webapp-02', severity:'medium', status:'mitigated', timestamp:new Date(Date.now()-52*60000) },
  { id:'t7', name:'Brute Force — SSH', source:'203.0.113.42', severity:'high', status:'mitigated', timestamp:new Date(Date.now()-78*60000) },
  { id:'t8', name:'Config File Exfil', source:'svc_backup', severity:'critical', status:'active', timestamp:new Date(Date.now()-95*60000) },
];
export const MOCK_LOG: LogEntry[] = [
  { id:'l1', timestamp:new Date(Date.now()-2*60000), level:'critical', message:'[CRIT] SQL injection blocked — db-api-03' },
  { id:'l2', timestamp:new Date(Date.now()-4*60000), level:'critical', message:'[CRIT] DDoS mitigation engaged — edge-01' },
  { id:'l3', timestamp:new Date(Date.now()-7*60000), level:'warn', message:'[WARN] Unusual auth pattern — svc_deploy' },
  { id:'l4', timestamp:new Date(Date.now()-12*60000), level:'warn', message:'[WARN] Port scan from 10.0.0.88' },
  { id:'l5', timestamp:new Date(Date.now()-18*60000), level:'ok', message:'[OK] Firewall rules updated — v4.2.1' },
  { id:'l6', timestamp:new Date(Date.now()-24*60000), level:'info', message:'[INFO] Neural model sync complete' },
  { id:'l7', timestamp:new Date(Date.now()-31*60000), level:'ok', message:'[OK] 842 nodes heartbeat confirmed' },
];
export const MOCK_NODES: NetworkNode[] = [
  { id:'n1', x:20, y:30, type:'threat' }, { id:'n2', x:65, y:55, type:'threat' },
  { id:'n3', x:80, y:20, type:'gateway' }, { id:'n4', x:45, y:70, type:'node' }, { id:'n5', x:35, y:45, type:'node' },
];
export const MOCK_METRICS: SystemMetric[] = [
  { label:'Threats Blocked', value:1247, delta:14, color:'cyan' },
  { label:'Active Threats', value:3, delta:2, color:'red' },
  { label:'Nodes Monitored', value:842, delta:0, color:'violet' },
  { label:'Threat Score', value:6.4, delta:2.3, color:'amber' },
];
export const MOCK_COVERAGE: DefenseCoverage[] = [
  { label:'Firewall', percentage:97, color:'cyan' },
  { label:'Intrusion Detection', percentage:91, color:'green' },
  { label:'Endpoint Security', percentage:88, color:'violet' },
  { label:'Data Encryption', percentage:74, color:'amber' },
  { label:'Patch Coverage', percentage:62, color:'red' },
];
