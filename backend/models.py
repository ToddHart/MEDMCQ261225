from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class DifficultyLevel(str, Enum):
    EASY = "1"
    MEDIUM = "2"
    HARD = "3"
    EXTREME = "4"

class SubscriptionTier(str, Enum):
    FREE = "free"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUAL = "annual"

class QuestionCategory(str, Enum):
    RESPIRATORY = "respiratory"
    CARDIOLOGY = "cardiology"
    CARDIOVASCULAR = "cardiovascular"
    NEUROLOGY = "neurology"
    NEUROSCIENCE = "neuroscience"
    ENDOCRINOLOGY = "endocrinology"
    UROLOGY = "urology"
    RENAL = "renal"
    HEMATOLOGY = "hematology"
    IMMUNOLOGY = "immunology"
    ANATOMY = "anatomy"
    GASTROENTEROLOGY = "gastroenterology"
    DERMATOLOGY = "dermatology"
    PSYCHIATRY = "psychiatry"
    PHARMACOLOGY = "pharmacology"
    PATHOLOGY = "pathology"
    MICROBIOLOGY = "microbiology"
    BIOCHEMISTRY = "biochemistry"
    PHYSIOLOGY = "physiology"
    OBSTETRICS = "obstetrics"
    GYNECOLOGY = "gynecology"
    PEDIATRICS = "pediatrics"
    ORTHOPEDICS = "orthopedics"
    OPHTHALMOLOGY = "ophthalmology"
    ENT = "ent"
    RADIOLOGY = "radiology"
    SURGERY = "surgery"
    MEDICINE = "medicine"
    GENERAL = "general"
    GENERAL_MEDICINE = "general medicine"
    INFECTIOUS_DISEASE = "infectious disease"
    RHEUMATOLOGY = "rheumatology"
    NEPHROLOGY = "nephrology"
    COMMUNITY_MEDICINE = "community medicine"

# User Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    institution: Optional[str] = None
    current_year: Optional[int] = None
    degree_type: Optional[str] = None
    country: Optional[str] = None
    marketing_consent: bool = False  # Must accept marketing for free tier

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Multi-tenant identifier
    tenant_id: str = "med"
    institution: Optional[str] = None
    current_year: Optional[int] = None
    degree_type: Optional[str] = None
    country: Optional[str] = None
    subscription_tier: SubscriptionTier = SubscriptionTier.FREE
    subscription_status: Optional[str] = "free"
    subscription_plan: Optional[str] = None
    subscription_end: Optional[str] = None
    storage_used_gb: float = 0.0
    storage_quota_gb: float = 5.0
    ai_daily_uses: int = 0
    ai_max_daily_uses: int = 10
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    is_admin: bool = False
    email_verified: bool = False  # Email verification status
    marketing_consent: bool = False  # Marketing consent for free users
    verification_token: Optional[str] = None  # For email verification

# Token Models
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None

# Question Models
class QuestionBase(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    category: QuestionCategory
    sub_category: Optional[str] = None  # For detailed analytics drilling
    year: int = Field(ge=1, le=6)
    difficulty: DifficultyLevel

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Multi-tenant identifier
    tenant_id: str = "med"
    user_id: Optional[str] = None  # None means global question
    source: str = "imported"  # imported, ai-generated, sample
    subcategory: Optional[str] = None  # For subcategory filtering
    created_at: datetime = Field(default_factory=datetime.utcnow)
    verified: bool = False

# User Progress Models
class UserAnswer(BaseModel):
    question_id: str
    selected_answer: int
    is_correct: bool
    time_taken: int  # seconds
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CategoryProgress(BaseModel):
    category: QuestionCategory
    current_difficulty: DifficultyLevel = DifficultyLevel.EASY
    correct_streak: int = 0
    wrong_streak: int = 0
    total_answered: int = 0
    total_correct: int = 0
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class UserProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Multi-tenant identifier
    tenant_id: str = "med"
    user_id: str
    category_progress: Dict[str, CategoryProgress] = {}
    subcategory_tracking: Optional[Dict[str, Any]] = {}  # For 3/4 complexity progression tracking
    total_questions_answered: int = 0
    total_correct: int = 0
    highest_streak: int = 0
    current_streak: int = 0
    total_time_spent: int = 0  # seconds
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    # UNE Priority System - Track qualifying sessions
    qualifying_sessions_completed: int = 0  # Sessions with 85%+ on 50+ questions
    full_bank_unlocked: bool = False  # True after 3 qualifying sessions

# Study Session Models
class StudySession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Multi-tenant identifier
    tenant_id: str = "med"
    user_id: str
    date: str  # YYYY-MM-DD format
    questions_answered: int = 0
    correct_answers: int = 0
    time_spent: int = 0  # seconds
    categories_studied: List[str] = []

# AI Generation Models
class AIGenerationRequest(BaseModel):
    topic: str
    context: str
    question_count: int = Field(ge=1, le=100)
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    category: QuestionCategory = QuestionCategory.GENERAL

class AIGenerationResponse(BaseModel):
    questions: List[Question]
    usage_count: int
    remaining_daily_uses: int

# File Upload Models
class FileUploadResponse(BaseModel):
    questions_imported: int
    questions: List[Question]

# Analytics Models
class UserAnalytics(BaseModel):
    total_questions: int
    correct_rate: float
    average_time_per_question: float
    study_days: int
    current_streak: int
    highest_streak: int
    category_performance: Dict[str, Dict[str, Any]]

# Exam Models
class ExamSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Multi-tenant identifier
    tenant_id: str = "med"
    user_id: str
    question_ids: List[str]
    answers: Dict[str, int]  # question_id -> selected_answer
    time_limit: int  # minutes
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    score: Optional[int] = None
    # Track original answer mappings for randomized options
    answer_mappings: Dict[str, List[int]] = {}  # question_id -> list of original indices in display order
    question_count: int = 0  # Total questions in session
    is_qualifying_session: bool = False  # Whether this session counted toward unlock

class ExamResult(BaseModel):
    score: int
    correct: int
    total: int
    time_taken: int
    detailed_results: List[Dict[str, Any]]

# Report Models
class QuestionReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Multi-tenant identifier
    tenant_id: str = "med"
    question_id: str
    user_id: str
    reason: str
    details: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    resolved: bool = False

# Storage Models
class StorageFile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    filename: str
    file_type: str
    size_bytes: int
    storage_path: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class DataExportRequest(BaseModel):
    include_questions: bool = True
    include_progress: bool = True
    include_sessions: bool = True
