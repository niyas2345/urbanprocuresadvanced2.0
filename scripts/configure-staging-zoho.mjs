// Managed cloud environment secrets may be destination-scoped proxy placeholders.
// Never persist process.env OAuth values into a Worker: they are not raw credentials.
// Use the Cloudflare dashboard to enter the actual credentials directly into the
// existing isolated staging Worker's encrypted secret bindings instead.
console.error('Environment-to-Worker OAuth secret transfer is disabled: proxy placeholders must not be deployed. Configure ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REFRESH_TOKEN directly as encrypted secrets on urbanprocures-advanced-staging-20261005. Do not paste credentials into chat.');
process.exitCode = 1;
