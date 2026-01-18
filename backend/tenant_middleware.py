"""Tenant Detection Middleware for Multi-Tenant Support

This module provides FastAPI dependencies for detecting the current tenant
based on the request's Host header.
"""

from fastapi import Request, Depends
from typing import Optional
import logging

from tenant_config import (
    TenantConfig,
    DEFAULT_TENANT,
    get_tenant_by_domain,
    get_tenant_by_id
)

logger = logging.getLogger(__name__)

# Domain mappings for local development
LOCAL_DOMAIN_MAPPINGS = {
    "localhost": "med",
    "127.0.0.1": "med",
    "med.localhost": "med",
    "nursing.localhost": "nursing",
    "vet.localhost": "vet",
}

# In-memory cache for tenant lookups (per-request optimization)
_request_tenant_cache = {}


def extract_domain_from_host(host: str) -> str:
    """
    Extract the domain from a Host header, stripping port if present.
    
    Args:
        host: The Host header value (e.g., "localhost:8001" or "medmcq.com.au")
        
    Returns:
        The domain without port (e.g., "localhost" or "medmcq.com.au")
    """
    if not host:
        return "localhost"
    
    # Strip port number if present
    if ":" in host:
        host = host.split(":")[0]
    
    return host.lower().strip()


async def get_current_tenant(request: Request) -> str:
    """
    FastAPI dependency to get the current tenant_id from the request.
    
    Extracts the Host header, looks up the tenant, and returns the tenant_id.
    Falls back to "med" if no matching tenant is found.
    
    Args:
        request: The FastAPI Request object
        
    Returns:
        The tenant_id string (e.g., "med", "nursing", "vet")
    """
    # Get host from request
    host = request.headers.get("host", "localhost")
    domain = extract_domain_from_host(host)
    
    # Check local development mappings first
    if domain in LOCAL_DOMAIN_MAPPINGS:
        tenant_id = LOCAL_DOMAIN_MAPPINGS[domain]
        logger.debug(f"Tenant detected from local mapping: {tenant_id} for domain {domain}")
        return tenant_id
    
    # Get database from app state
    db = request.app.state.db
    
    # Try to find tenant by domain
    tenant = await get_tenant_by_domain(db, domain)
    
    if tenant:
        logger.debug(f"Tenant detected from database: {tenant.tenant_id} for domain {domain}")
        return tenant.tenant_id
    
    # Fallback to default tenant
    logger.debug(f"No tenant found for domain {domain}, falling back to 'med'")
    return "med"


async def get_tenant_config(request: Request) -> TenantConfig:
    """
    FastAPI dependency to get the full TenantConfig for the current request.
    
    Args:
        request: The FastAPI Request object
        
    Returns:
        The TenantConfig object for the current tenant
    """
    # Get host from request
    host = request.headers.get("host", "localhost")
    domain = extract_domain_from_host(host)
    
    # Check local development mappings first
    if domain in LOCAL_DOMAIN_MAPPINGS:
        tenant_id = LOCAL_DOMAIN_MAPPINGS[domain]
        db = request.app.state.db
        tenant = await get_tenant_by_id(db, tenant_id)
        if tenant:
            return tenant
        return DEFAULT_TENANT
    
    # Get database from app state
    db = request.app.state.db
    
    # Try to find tenant by domain
    tenant = await get_tenant_by_domain(db, domain)
    
    if tenant:
        return tenant
    
    # Fallback to default tenant
    return DEFAULT_TENANT


async def get_optional_tenant(request: Request) -> Optional[str]:
    """
    FastAPI dependency to get the current tenant_id, returning None if not determinable.
    
    Useful for endpoints that may need tenant-aware behavior but shouldn't fail
    if tenant cannot be determined.
    
    Args:
        request: The FastAPI Request object
        
    Returns:
        The tenant_id string or None
    """
    try:
        return await get_current_tenant(request)
    except Exception as e:
        logger.warning(f"Could not determine tenant: {e}")
        return None
