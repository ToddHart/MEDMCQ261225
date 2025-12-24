import os
from typing import List, Dict
from emergentintegrations.llm.chat import LlmChat, UserMessage
from models import Question, QuestionCategory, DifficultyLevel, AIGenerationRequest
import json
import re
import uuid
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class AIService:
    """AI service for generating medical MCQs using LLM"""
    
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        self.model = "gpt-5.1"
        self.provider = "openai"
    
    async def generate_questions(self, request: AIGenerationRequest, user_id: str) -> List[Question]:
        """Generate medical MCQ questions from user's study materials"""
        
        # Create system prompt
        system_message = self._create_system_prompt()
        
        # Create user prompt
        user_prompt = self._create_user_prompt(request)
        
        # Initialize LLM chat
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"user_{user_id}_{uuid.uuid4()}",
            system_message=system_message
        ).with_model(self.provider, self.model)
        
        # Send message and get response
        user_message = UserMessage(text=user_prompt)
        response = await chat.send_message(user_message)
        
        # Parse response into questions
        questions = self._parse_ai_response(response, request, user_id)
        
        # Validate questions
        validated_questions = self._validate_questions(questions)
        
        return validated_questions
    
    def _create_system_prompt(self) -> str:
        """Create the system prompt for MCQ generation"""
        return """You are an expert medical educator specializing in creating high-quality multiple-choice questions for medical students.

Your task is to generate medical MCQ questions that:
1. Are based ONLY on the provided study materials
2. Test clinical reasoning and knowledge application
3. Include 4-5 options with one clearly correct answer
4. Provide detailed explanations that teach the concept
5. Are medically accurate and aligned with current medical standards
6. Match the specified difficulty level
7. Are formatted in valid JSON

IMPORTANT: Return ONLY a valid JSON array, no additional text."""
    
    def _create_user_prompt(self, request: AIGenerationRequest) -> str:
        """Create the user prompt with context and requirements"""
        difficulty_desc = {
            DifficultyLevel.EASY: "basic recall and simple application",
            DifficultyLevel.MEDIUM: "clinical reasoning and differential diagnosis",
            DifficultyLevel.HARD: "complex clinical scenarios with multiple factors",
            DifficultyLevel.EXTREME: "rare conditions or highly complex multi-step reasoning"
        }
        
        return f"""Generate {request.question_count} medical MCQ questions on the topic: {request.topic}

Difficulty Level: {difficulty_desc.get(request.difficulty, 'medium')}
Category: {request.category.value}

Study Materials:
{request.context}

Generate questions that test understanding of the above materials. Return a JSON array with this exact structure:

[
  {{
    "question": "A 45-year-old patient presents with...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 2,
    "explanation": "Detailed explanation of why this is correct..."
  }}
]

Rules:
1. Each question must have 4-5 options
2. correct_answer is the index (0-based) of the correct option
3. Explanations should be educational and reference the study materials
4. Questions must be clinically relevant
5. Return ONLY the JSON array, nothing else"""
    
    def _parse_ai_response(self, response: str, request: AIGenerationRequest, user_id: str) -> List[Question]:
        """Parse AI response into Question objects"""
        try:
            # Extract JSON from response
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                response = json_match.group(0)
            
            # Parse JSON
            questions_data = json.loads(response)
            
            questions = []
            for q_data in questions_data:
                question = Question(
                    id=str(uuid.uuid4()),
                    question=q_data["question"],
                    options=q_data["options"],
                    correct_answer=q_data["correct_answer"],
                    explanation=q_data["explanation"],
                    category=request.category,
                    year=2,  # Default to Year 2
                    difficulty=request.difficulty,
                    user_id=user_id,
                    source="ai-generated",
                    created_at=datetime.utcnow(),
                    verified=False
                )
                questions.append(question)
            
            return questions
        
        except Exception as e:
            print(f"Error parsing AI response: {e}")
            print(f"Response: {response}")
            return []
    
    def _validate_questions(self, questions: List[Question]) -> List[Question]:
        """Validate questions using rule-based validation
        
        Rule-based validation:
        1. Question must be at least 50 characters
        2. Must have 4-5 options
        3. Correct answer index must be valid
        4. Explanation must be at least 50 characters
        5. No duplicate options
        6. Options must not be empty
        """
        validated = []
        
        for question in questions:
            try:
                # Rule 1: Question length
                if len(question.question) < 50:
                    continue
                
                # Rule 2: Number of options
                if len(question.options) < 4 or len(question.options) > 5:
                    continue
                
                # Rule 3: Valid correct answer
                if question.correct_answer < 0 or question.correct_answer >= len(question.options):
                    continue
                
                # Rule 4: Explanation length
                if len(question.explanation) < 50:
                    continue
                
                # Rule 5: No duplicate options
                if len(question.options) != len(set(question.options)):
                    continue
                
                # Rule 6: No empty options
                if any(not opt.strip() for opt in question.options):
                    continue
                
                # Mark as verified (passed rule-based validation)
                question.verified = True
                validated.append(question)
            
            except Exception as e:
                print(f"Error validating question: {e}")
                continue
        
        return validated

# Global instance
ai_service = AIService()