export interface BotProtocol {
  job: string;
  allowedTools: string;
  allowedData: string;
  forbiddenActions: string;
}

export interface BotActivity {
  prompt?: string;
  tool?: string;
  data?: string;
  action?: string;
  reply?: string;
}

export interface ProtocolCheckResult {
  verdict: 'pass' | 'fail';
  violation: string | null;
}

export function parseList(value: string): string[] {
  return value.split(/[,;\n]/).map(part => part.trim().toLowerCase()).filter(Boolean);
}

function listed(value: string, list: string[]): boolean {
  const needle = value.trim().toLowerCase();
  return list.some(item => item === needle);
}

export function checkActivity(protocol: BotProtocol, activity: BotActivity): ProtocolCheckResult {
  const tools = parseList(protocol.allowedTools);
  const data = parseList(protocol.allowedData);
  const forbidden = parseList(protocol.forbiddenActions);
  const hasRules = tools.length > 0 || data.length > 0 || forbidden.length > 0;
  if (!hasRules) {
    return {
      verdict: 'fail',
      violation: 'This bot has no protocol rules. Add allowed tools, allowed data, or forbidden actions.',
    };
  }

  const prompt = activity.prompt?.trim() ?? '';
  const tool = activity.tool?.trim() ?? '';
  const accessed = activity.data?.trim() ?? '';
  const action = activity.action?.trim() ?? '';
  const reply = activity.reply?.trim() ?? '';
  if (!prompt && !tool && !accessed && !action && !reply) {
    return { verdict: 'fail', violation: 'No activity was sent to check.' };
  }

  if (tool) {
    if (tools.length === 0) {
      return { verdict: 'fail', violation: `Used the tool “${tool}”, and the protocol lists no allowed tools.` };
    }
    if (!listed(tool, tools)) {
      return { verdict: 'fail', violation: `Used the tool “${tool}”, which is not in the protocol.` };
    }
  }

  if (accessed) {
    if (data.length === 0) {
      return { verdict: 'fail', violation: `Read “${accessed}”, and the protocol lists no allowed data.` };
    }
    if (!listed(accessed, data)) {
      return { verdict: 'fail', violation: `Read “${accessed}”, which is not in the protocol.` };
    }
  }

  const spoken = [action, prompt, reply].filter(Boolean).join('\n').toLowerCase();
  const hit = forbidden.find(phrase => spoken.includes(phrase));
  if (hit) {
    return { verdict: 'fail', violation: `This step includes “${hit}”, which the protocol forbids.` };
  }

  return { verdict: 'pass', violation: null };
}
