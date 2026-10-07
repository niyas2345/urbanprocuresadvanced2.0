// Runtime fail-closed boundary for the independent Advanced project.
export function isIsolatedAdvancedRequest(request: Request, environment: string, platformDomain: string): boolean {
  if(environment==='advanced-production'){
    // Only the separately audited Advanced production deployment may serve
    // these hosts. Staging remains forbidden from handling the live domain.
    const url=new URL(request.url);
    return platformDomain==='urbanprocures.com'&&url.protocol==='https:'&&[
      'urbanprocures.com','www.urbanprocures.com',
      'urbanprocures-advanced-production-20261007.abdeenniyas23.workers.dev',
    ].includes(url.hostname.toLowerCase());
  }
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
