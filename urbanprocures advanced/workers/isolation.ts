// Runtime fail-closed boundary for the independent Advanced project.
export function isIsolatedAdvancedRequest(request: Request, environment: string, platformDomain: string): boolean {
  if (!['advanced-development', 'advanced-staging'].includes(environment) || typeof platformDomain !== 'string' || !platformDomain.trim()) return false;
  const isProductionHost = (host: string) => {
    const normalized = host.toLowerCase().replace(/\.$/, '');
    return normalized === 'urbanprocures.com' || normalized.endsWith('.urbanprocures.com');
  };
  let configuredHost: string;
  try {
    configuredHost = new URL(platformDomain.includes('://') ? platformDomain : `https://${platformDomain}`).hostname;
  } catch { return false; }
  return !isProductionHost(new URL(request.url).hostname) && !isProductionHost(configuredHost);
}
