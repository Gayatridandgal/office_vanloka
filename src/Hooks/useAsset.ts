const useAsset = () => {
  const getTenantFromSubdomain = (): string | null => {
    const hostname = window.location.hostname;

    // Extract subdomain: volvo.localhost -> volvo
    const parts = hostname.split(".");

    if (parts.length > 1) {
      const subdomain = parts[0];
      // Exclude 'localhost' or 'www' or main domain
      if (subdomain && subdomain !== "localhost" && subdomain !== "www") {
        return subdomain;
      }
    }

    return null;
  };

  const asset = (filePath: string | null | undefined): string | null => {
    if (!filePath) return null;

    const tenantId = getTenantFromSubdomain();
    if (!tenantId) return null;

    return `tenants/${tenantId}/${filePath}`;
  };

  return asset;
};

export default useAsset;
