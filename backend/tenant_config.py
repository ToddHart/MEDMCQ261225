"""Multi-tenant Configuration System for MedMCQ

This module provides tenant configuration management including:
- TenantConfig model definition
- Database operations for tenant lookup
- Default tenant configuration
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)


class TenantConfig(BaseModel):
    """Tenant configuration model for multi-tenant support."""
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str  # Unique identifier like "med", "nursing", "vet"
    domain: str  # e.g., "medmcq.com.au"
    name: str  # Display name e.g., "MedMCQ"
    tagline: str  # e.g., "Medical Student Learning Platform"
    support_email: str
    primary_color: str  # Hex code e.g., "#2563eb"
    secondary_color: str  # Hex code e.g., "#7c3aed"
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    footer_company: str  # Company name for footer
    footer_abn: Optional[str] = None
    footer_address: Optional[str] = None
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: Optional[str] = None


class TenantCreate(BaseModel):
    """Model for creating a new tenant."""
    tenant_id: str
    domain: str
    name: str
    tagline: str
    support_email: str
    primary_color: str = "#2563eb"
    secondary_color: str = "#7c3aed"
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    footer_company: str
    footer_abn: Optional[str] = None
    footer_address: Optional[str] = None


class TenantUpdate(BaseModel):
    """Model for updating a tenant."""
    domain: Optional[str] = None
    name: Optional[str] = None
    tagline: Optional[str] = None
    support_email: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    footer_company: Optional[str] = None
    footer_abn: Optional[str] = None
    footer_address: Optional[str] = None
    is_active: Optional[bool] = None


# Default MedMCQ tenant configuration
DEFAULT_TENANT = TenantConfig(
    tenant_id="med",
    domain="medmcq.com.au",
    name="MedMCQ",
    tagline="Medical Student Learning Platform",
    support_email="support@medmcq.com.au",
    primary_color="#2563eb",
    secondary_color="#7c3aed",
    logo_url=None,
    favicon_url=None,
    footer_company="ABUNDITA INVESTMENTS PTY LTD",
    footer_abn="55 100 379 299",
    footer_address="2/24 Edgar St, Coffs Harbour NSW 2450, Australia",
    is_active=True
)


# In-memory cache for tenant lookups (cleared on updates)
_tenant_cache = {}
_tenant_cache_by_id = {}


def clear_tenant_cache():
    """Clear the tenant cache after updates."""
    global _tenant_cache, _tenant_cache_by_id
    _tenant_cache = {}
    _tenant_cache_by_id = {}
    logger.info("Tenant cache cleared")


async def get_tenant_by_domain(db, domain: str) -> Optional[TenantConfig]:
    """
    Get tenant configuration by domain.
    
    Args:
        db: MongoDB database instance
        domain: The domain to look up (e.g., "medmcq.com.au")
        
    Returns:
        TenantConfig if found, None otherwise
    """
    # Check cache first
    if domain in _tenant_cache:
        return _tenant_cache[domain]
    
    # Query database
    tenant_doc = await db.tenants.find_one({"domain": domain, "is_active": True}, {"_id": 0})
    
    if tenant_doc:
        tenant = TenantConfig(**tenant_doc)
        _tenant_cache[domain] = tenant
        _tenant_cache_by_id[tenant.tenant_id] = tenant
        return tenant
    
    return None


async def get_tenant_by_id(db, tenant_id: str) -> Optional[TenantConfig]:
    """
    Get tenant configuration by tenant_id.
    
    Args:
        db: MongoDB database instance
        tenant_id: The tenant ID to look up (e.g., "med")
        
    Returns:
        TenantConfig if found, None otherwise
    """
    # Check cache first
    if tenant_id in _tenant_cache_by_id:
        return _tenant_cache_by_id[tenant_id]
    
    # Query database
    tenant_doc = await db.tenants.find_one({"tenant_id": tenant_id, "is_active": True}, {"_id": 0})
    
    if tenant_doc:
        tenant = TenantConfig(**tenant_doc)
        _tenant_cache[tenant.domain] = tenant
        _tenant_cache_by_id[tenant_id] = tenant
        return tenant
    
    return None


async def get_all_tenants(db, include_inactive: bool = False) -> List[TenantConfig]:
    """
    Get all tenant configurations.
    
    Args:
        db: MongoDB database instance
        include_inactive: Whether to include inactive tenants
        
    Returns:
        List of TenantConfig objects
    """
    query = {} if include_inactive else {"is_active": True}
    tenant_docs = await db.tenants.find(query, {"_id": 0}).to_list(1000)
    return [TenantConfig(**doc) for doc in tenant_docs]


async def create_tenant(db, tenant_data: TenantCreate) -> TenantConfig:
    """
    Create a new tenant.
    
    Args:
        db: MongoDB database instance
        tenant_data: TenantCreate model with tenant details
        
    Returns:
        Created TenantConfig
    """
    tenant = TenantConfig(
        tenant_id=tenant_data.tenant_id,
        domain=tenant_data.domain,
        name=tenant_data.name,
        tagline=tenant_data.tagline,
        support_email=tenant_data.support_email,
        primary_color=tenant_data.primary_color,
        secondary_color=tenant_data.secondary_color,
        logo_url=tenant_data.logo_url,
        favicon_url=tenant_data.favicon_url,
        footer_company=tenant_data.footer_company,
        footer_abn=tenant_data.footer_abn,
        footer_address=tenant_data.footer_address
    )
    
    await db.tenants.insert_one(tenant.model_dump())
    clear_tenant_cache()
    
    return tenant


async def update_tenant(db, tenant_id: str, update_data: TenantUpdate) -> Optional[TenantConfig]:
    """
    Update a tenant configuration.
    
    Args:
        db: MongoDB database instance
        tenant_id: The tenant ID to update
        update_data: TenantUpdate model with fields to update
        
    Returns:
        Updated TenantConfig if found, None otherwise
    """
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict['updated_at'] = datetime.utcnow().isoformat()
    
    result = await db.tenants.update_one(
        {"tenant_id": tenant_id},
        {"$set": update_dict}
    )
    
    if result.modified_count > 0:
        clear_tenant_cache()
        return await get_tenant_by_id(db, tenant_id)
    
    return None


async def deactivate_tenant(db, tenant_id: str) -> bool:
    """
    Deactivate a tenant (soft delete).
    
    Args:
        db: MongoDB database instance
        tenant_id: The tenant ID to deactivate
        
    Returns:
        True if deactivated, False if not found
    """
    result = await db.tenants.update_one(
        {"tenant_id": tenant_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow().isoformat()}}
    )
    
    if result.modified_count > 0:
        clear_tenant_cache()
        return True
    
    return False


async def ensure_default_tenant(db):
    """
    Ensure the default MedMCQ tenant exists in the database.
    
    Args:
        db: MongoDB database instance
    """
    existing = await db.tenants.find_one({"tenant_id": "med"})
    
    if not existing:
        await db.tenants.insert_one(DEFAULT_TENANT.model_dump())
        logger.info("Created default MedMCQ tenant")
    else:
        logger.info("Default MedMCQ tenant already exists")
