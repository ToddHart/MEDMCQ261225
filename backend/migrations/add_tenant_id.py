"""Data Migration Script: Add tenant_id to Existing Records

This script adds tenant_id="med" to all existing documents that don't have one,
ensuring backward compatibility with the multi-tenant system.

Usage:
    python -m migrations.add_tenant_id
"""

import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Default tenant configuration
DEFAULT_TENANT = {
    "id": "default-tenant-med",
    "tenant_id": "med",
    "domain": "medmcq.com.au",
    "name": "MedMCQ",
    "tagline": "Medical Student Learning Platform",
    "support_email": "support@medmcq.com.au",
    "primary_color": "#2563eb",
    "secondary_color": "#7c3aed",
    "logo_url": None,
    "favicon_url": None,
    "footer_company": "ABUNDITA INVESTMENTS PTY LTD",
    "footer_abn": "55 100 379 299",
    "footer_address": "2/24 Edgar St, Coffs Harbour NSW 2450, Australia",
    "is_active": True,
    "created_at": datetime.utcnow().isoformat()
}

# Collections that need tenant_id
COLLECTIONS_TO_UPDATE = [
    "users",
    "questions",
    "user_progress",
    "study_sessions",
    "exam_sessions",
    "question_reports",
    "answer_history",
    "daily_usage",
    "category_progress",
    "subscription_history",
    "password_resets"
]


async def run_migration():
    """Run the tenant_id migration."""
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    logger.info(f"Connecting to MongoDB: {mongo_url}")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    total_updated = 0
    
    try:
        # Step 1: Create/Update default tenant
        logger.info("Step 1: Ensuring default 'med' tenant exists...")
        existing_tenant = await db.tenants.find_one({"tenant_id": "med"})
        
        if existing_tenant:
            logger.info("Default tenant 'med' already exists")
        else:
            await db.tenants.insert_one(DEFAULT_TENANT)
            logger.info("Created default tenant 'med'")
        
        # Step 2: Add tenant_id to all collections
        for collection_name in COLLECTIONS_TO_UPDATE:
            logger.info(f"\nStep 2.{COLLECTIONS_TO_UPDATE.index(collection_name) + 1}: Processing collection '{collection_name}'...")
            
            collection = db[collection_name]
            
            # Count documents without tenant_id
            count_without = await collection.count_documents({"tenant_id": {"$exists": False}})
            
            if count_without > 0:
                # Update documents without tenant_id
                result = await collection.update_many(
                    {"tenant_id": {"$exists": False}},
                    {"$set": {"tenant_id": "med"}}
                )
                logger.info(f"  Updated {result.modified_count} documents in '{collection_name}'")
                total_updated += result.modified_count
            else:
                logger.info(f"  No documents need updating in '{collection_name}'")
        
        # Step 3: Create indexes for tenant queries
        logger.info("\nStep 3: Creating indexes for tenant queries...")
        
        try:
            # Tenants collection indexes
            await db.tenants.create_index("domain", unique=True)
            await db.tenants.create_index("tenant_id", unique=True)
            logger.info("  Created indexes on tenants collection")
        except Exception as e:
            logger.warning(f"  Index may already exist on tenants: {e}")
        
        try:
            # Users - lookup by email within tenant
            await db.users.create_index([("tenant_id", 1), ("email", 1)])
            logger.info("  Created compound index on users (tenant_id, email)")
        except Exception as e:
            logger.warning(f"  Index may already exist on users: {e}")
        
        try:
            # Questions - filter by tenant and category
            await db.questions.create_index([("tenant_id", 1), ("category", 1)])
            await db.questions.create_index([("tenant_id", 1), ("source", 1)])
            logger.info("  Created indexes on questions collection")
        except Exception as e:
            logger.warning(f"  Indexes may already exist on questions: {e}")
        
        try:
            # User progress - lookup by user and tenant
            await db.user_progress.create_index([("tenant_id", 1), ("user_id", 1)])
            logger.info("  Created index on user_progress collection")
        except Exception as e:
            logger.warning(f"  Index may already exist on user_progress: {e}")
        
        try:
            # Study sessions - lookup by user, tenant, date
            await db.study_sessions.create_index([("tenant_id", 1), ("user_id", 1), ("date", 1)])
            logger.info("  Created index on study_sessions collection")
        except Exception as e:
            logger.warning(f"  Index may already exist on study_sessions: {e}")
        
        try:
            # Exam sessions - lookup by tenant and user
            await db.exam_sessions.create_index([("tenant_id", 1), ("user_id", 1)])
            logger.info("  Created index on exam_sessions collection")
        except Exception as e:
            logger.warning(f"  Index may already exist on exam_sessions: {e}")
        
        logger.info(f"\n{'='*50}")
        logger.info(f"Migration completed successfully!")
        logger.info(f"Total documents updated: {total_updated}")
        logger.info(f"{'='*50}")
        
        return {
            "success": True,
            "total_updated": total_updated,
            "message": f"Migration completed. Updated {total_updated} documents."
        }
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Migration failed: {e}"
        }
    finally:
        client.close()


if __name__ == "__main__":
    result = asyncio.run(run_migration())
    print(f"\nResult: {result}")
