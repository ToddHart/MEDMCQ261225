from typing import Dict, List
from models import (
    UserProgress, CategoryProgress, UserAnswer, 
    QuestionCategory, DifficultyLevel, Question
)
from datetime import datetime

class AdaptiveLearningEngine:
    """Adaptive learning engine implementing 3-Up, 2-Down difficulty scaling"""
    
    # Difficulty progression order
    DIFFICULTY_ORDER = [
        DifficultyLevel.EASY,
        DifficultyLevel.MEDIUM,
        DifficultyLevel.HARD,
        DifficultyLevel.EXTREME
    ]
    
    # Rules
    LEVEL_UP_THRESHOLD = 3  # 3 consecutive correct answers
    LEVEL_DOWN_THRESHOLD = 2  # 2 consecutive wrong answers
    
    def __init__(self):
        pass
    
    def process_answer(
        self, 
        progress: UserProgress, 
        answer: UserAnswer, 
        question: Question
    ) -> UserProgress:
        """Process a user's answer and update progress
        
        Implements:
        1. Update category progress
        2. Apply 3-Up, 2-Down rule
        3. Update overall statistics
        """
        category = question.category.value
        
        # Initialize category progress if not exists
        if category not in progress.category_progress:
            progress.category_progress[category] = CategoryProgress(
                category=question.category,
                current_difficulty=DifficultyLevel.EASY,
                correct_streak=0,
                total_answered=0,
                total_correct=0,
                last_updated=datetime.utcnow()
            )
        
        cat_progress = progress.category_progress[category]
        
        # Update category statistics
        cat_progress.total_answered += 1
        if answer.is_correct:
            cat_progress.total_correct += 1
            cat_progress.correct_streak += 1
            
            # Update global streak
            progress.current_streak += 1
            if progress.current_streak > progress.highest_streak:
                progress.highest_streak = progress.current_streak
        else:
            cat_progress.correct_streak = 0
            progress.current_streak = 0
        
        # Apply adaptive difficulty logic
        cat_progress = self._apply_adaptive_logic(cat_progress, answer.is_correct)
        
        # Update global statistics
        progress.total_questions_answered += 1
        if answer.is_correct:
            progress.total_correct += 1
        progress.total_time_spent += answer.time_taken
        progress.last_activity = datetime.utcnow()
        
        # Update category progress
        progress.category_progress[category] = cat_progress
        
        return progress
    
    def _apply_adaptive_logic(
        self, 
        cat_progress: CategoryProgress, 
        is_correct: bool
    ) -> CategoryProgress:
        """Apply 3-Up, 2-Down rule to adjust difficulty"""
        current_index = self.DIFFICULTY_ORDER.index(cat_progress.current_difficulty)
        
        if is_correct:
            # Level up: 3 consecutive correct answers
            if cat_progress.correct_streak >= self.LEVEL_UP_THRESHOLD:
                if current_index < len(self.DIFFICULTY_ORDER) - 1:
                    cat_progress.current_difficulty = self.DIFFICULTY_ORDER[current_index + 1]
                    cat_progress.correct_streak = 0  # Reset streak after level up
                    print(f"Level UP! Now at {cat_progress.current_difficulty}")
            # Reset wrong streak on correct answer
            cat_progress.wrong_streak = 0
        else:
            # Level down: 2 consecutive wrong answers
            cat_progress.wrong_streak += 1
            
            if cat_progress.wrong_streak >= self.LEVEL_DOWN_THRESHOLD:
                if current_index > 0:
                    cat_progress.current_difficulty = self.DIFFICULTY_ORDER[current_index - 1]
                    cat_progress.wrong_streak = 0
                    print(f"Level DOWN! Now at {cat_progress.current_difficulty}")
            
            # Reset correct streak on wrong answer
            cat_progress.correct_streak = 0
        
        cat_progress.last_updated = datetime.utcnow()
        return cat_progress
    
    def get_next_questions(
        self, 
        progress: UserProgress, 
        available_questions: List[Question],
        category: QuestionCategory = None,
        count: int = 10
    ) -> List[Question]:
        """Get the next set of questions based on user's progress
        
        Strategy:
        1. If category specified, use that category
        2. Otherwise, select from weakest categories
        3. Match difficulty to user's current level
        4. Randomize within constraints
        """
        if category:
            # Filter by specific category
            cat_name = category.value
            if cat_name in progress.category_progress:
                target_difficulty = progress.category_progress[cat_name].current_difficulty
            else:
                target_difficulty = DifficultyLevel.EASY
            
            filtered = [
                q for q in available_questions 
                if q.category == category and q.difficulty == target_difficulty
            ]
        else:
            # Select from multiple categories based on progress
            filtered = self._select_adaptive_questions(progress, available_questions)
        
        # Limit to requested count
        import random
        random.shuffle(filtered)
        return filtered[:count]
    
    def _select_adaptive_questions(
        self, 
        progress: UserProgress, 
        available_questions: List[Question]
    ) -> List[Question]:
        """Select questions adaptively across categories"""
        selected = []
        
        # Get categories sorted by performance (weakest first)
        categories_by_performance = self._get_categories_by_performance(progress)
        
        # For each category, get questions at appropriate difficulty
        for category_name in categories_by_performance:
            if category_name in progress.category_progress:
                target_difficulty = progress.category_progress[category_name].current_difficulty
            else:
                target_difficulty = DifficultyLevel.EASY
            
            # Find questions for this category and difficulty
            category_questions = [
                q for q in available_questions
                if q.category.value == category_name and q.difficulty == target_difficulty
            ]
            
            selected.extend(category_questions)
        
        return selected
    
    def _get_categories_by_performance(self, progress: UserProgress) -> List[str]:
        """Get categories sorted by performance (weakest first)"""
        category_scores = {}
        
        for cat_name, cat_progress in progress.category_progress.items():
            if cat_progress.total_answered > 0:
                score = cat_progress.total_correct / cat_progress.total_answered
            else:
                score = 0
            category_scores[cat_name] = score
        
        # Sort by score (ascending - weakest first)
        sorted_categories = sorted(category_scores.items(), key=lambda x: x[1])
        return [cat for cat, score in sorted_categories]
    
    def should_unlock_advanced(self, progress: UserProgress, category: QuestionCategory) -> bool:
        """Check if user should unlock advanced difficulty in a category
        
        Rule: Must have at least 70% accuracy in medium difficulty
        """
        cat_name = category.value
        if cat_name not in progress.category_progress:
            return False
        
        cat_progress = progress.category_progress[cat_name]
        
        # Check if currently at medium and performing well
        if cat_progress.current_difficulty == DifficultyLevel.MEDIUM:
            if cat_progress.total_answered >= 10:  # At least 10 questions
                accuracy = cat_progress.total_correct / cat_progress.total_answered
                return accuracy >= 0.7
        
        return False

# Global instance
adaptive_engine = AdaptiveLearningEngine()