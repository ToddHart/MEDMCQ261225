import React, { createContext, useState, useContext, useEffect } from 'react';
import { getTenantConfig } from '../api/endpoints';

const TenantContext = createContext();

// Default tenant configuration (MedMCQ)
const DEFAULT_TENANT = {
  tenant_id: 'med',
  name: 'MedMCQ',
  tagline: 'Medical Student Learning Platform',
  support_email: 'support@medmcq.com.au',
  primary_color: '#2563eb',
  secondary_color: '#7c3aed',
  logo_url: null,
  favicon_url: null,
  footer_company: 'ABUNDITA INVESTMENTS PTY LTD',
  footer_abn: '55 100 379 299',
  footer_address: '2/24 Edgar St, Coffs Harbour NSW 2450, Australia',
  is_active: true
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(DEFAULT_TENANT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenantConfig = async () => {
      try {
        const domain = window.location.hostname;
        const response = await getTenantConfig(domain);
        setTenant(response.data);
        
        // Update favicon if provided
        if (response.data.favicon_url) {
          const favicon = document.querySelector('link[rel="icon"]');
          if (favicon) {
            favicon.href = response.data.favicon_url;
          }
        }
        
        // Update document title with tenant name
        document.title = response.data.name;
        
      } catch (err) {
        console.error('Error fetching tenant config:', err);
        setError(err);
        // Keep default tenant on error
        setTenant(DEFAULT_TENANT);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantConfig();
  }, []);

  // Helper function to apply tenant primary color
  const getPrimaryColor = () => tenant.primary_color || DEFAULT_TENANT.primary_color;
  const getSecondaryColor = () => tenant.secondary_color || DEFAULT_TENANT.secondary_color;

  return (
    <TenantContext.Provider
      value={{
        tenant,
        loading,
        error,
        getPrimaryColor,
        getSecondaryColor,
        isLoading: loading
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext;
