import os
import uuid
from typing import Optional, List
import json
from datetime import datetime

class MockStorageService:
    """Mock storage service that simulates Backblaze B2
    
    In production, this would be replaced with actual B2 SDK integration.
    For now, it stores metadata and simulates file operations.
    """
    
    def __init__(self):
        self.storage_path = "/tmp/medmcq_storage"
        os.makedirs(self.storage_path, exist_ok=True)
        
    def _get_user_path(self, user_id: str) -> str:
        """Get user's storage directory"""
        path = os.path.join(self.storage_path, user_id)
        os.makedirs(path, exist_ok=True)
        return path
    
    async def upload_file(self, user_id: str, filename: str, file_data: bytes) -> dict:
        """Upload a file to user's storage
        
        In production, this would:
        1. Upload to Backblaze B2
        2. Generate signed URL with expiration
        3. Store metadata in database
        """
        file_id = str(uuid.uuid4())
        user_path = self._get_user_path(user_id)
        
        # Simulate file storage
        file_path = os.path.join(user_path, f"{file_id}_{filename}")
        
        # In mock mode, just store metadata
        metadata = {
            "file_id": file_id,
            "filename": filename,
            "size_bytes": len(file_data),
            "storage_path": file_path,
            "uploaded_at": datetime.utcnow().isoformat(),
            "mock_url": f"https://mock-b2.com/{user_id}/{file_id}/{filename}"
        }
        
        # Save metadata
        metadata_path = os.path.join(user_path, "metadata.json")
        metadata_list = []
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata_list = json.load(f)
        
        metadata_list.append(metadata)
        with open(metadata_path, 'w') as f:
            json.dump(metadata_list, f)
        
        return metadata
    
    async def get_signed_url(self, user_id: str, file_id: str, expires_in: int = 3600) -> str:
        """Get a signed URL for file access
        
        In production, this would generate a B2 signed URL with expiration.
        """
        return f"https://mock-b2-signed.com/{user_id}/{file_id}?expires={expires_in}"
    
    async def delete_file(self, user_id: str, file_id: str) -> bool:
        """Delete a file from storage"""
        user_path = self._get_user_path(user_id)
        metadata_path = os.path.join(user_path, "metadata.json")
        
        if not os.path.exists(metadata_path):
            return False
        
        with open(metadata_path, 'r') as f:
            metadata_list = json.load(f)
        
        # Remove file metadata
        metadata_list = [m for m in metadata_list if m["file_id"] != file_id]
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata_list, f)
        
        return True
    
    async def get_user_storage_usage(self, user_id: str) -> float:
        """Calculate user's total storage usage in GB"""
        user_path = self._get_user_path(user_id)
        metadata_path = os.path.join(user_path, "metadata.json")
        
        if not os.path.exists(metadata_path):
            return 0.0
        
        with open(metadata_path, 'r') as f:
            metadata_list = json.load(f)
        
        total_bytes = sum(m["size_bytes"] for m in metadata_list)
        return total_bytes / (1024 ** 3)  # Convert to GB
    
    async def list_user_files(self, user_id: str) -> List[dict]:
        """List all files for a user"""
        user_path = self._get_user_path(user_id)
        metadata_path = os.path.join(user_path, "metadata.json")
        
        if not os.path.exists(metadata_path):
            return []
        
        with open(metadata_path, 'r') as f:
            return json.load(f)

# Global instance
storage_service = MockStorageService()

# Instructions for production B2 integration:
"""
To integrate with real Backblaze B2:

1. Install B2 SDK:
   pip install b2sdk

2. Replace MockStorageService with:
   
from b2sdk.v2 import InMemoryAccountInfo, B2Api

class B2StorageService:
    def __init__(self):
        info = InMemoryAccountInfo()
        self.b2_api = B2Api(info)
        self.b2_api.authorize_account(
            "production",
            os.getenv("B2_APPLICATION_KEY_ID"),
            os.getenv("B2_APPLICATION_KEY")
        )
        self.bucket = self.b2_api.get_bucket_by_name(os.getenv("B2_BUCKET_NAME"))
    
    async def upload_file(self, user_id: str, filename: str, file_data: bytes) -> dict:
        file_info = self.bucket.upload_bytes(
            file_data,
            f"{user_id}/{filename}"
        )
        return {
            "file_id": file_info.id_,
            "filename": filename,
            "size_bytes": len(file_data),
            "storage_path": file_info.file_name
        }
    
    async def get_signed_url(self, user_id: str, file_id: str, expires_in: int = 3600) -> str:
        return self.b2_api.get_download_url_for_fileid(file_id)
"""