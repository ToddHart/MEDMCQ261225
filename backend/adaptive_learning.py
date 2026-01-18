from typing import Dict, List
from models import (
    UserProgress, CategoryProgress, UserAnswer, 
    QuestionCategory, DifficultyLevel, Question
)
from datetime import datetime

class AdaptiveLearningEngine:
    """Adaptive learning engine implementing complexity progression:
    - 3 correct from last 4 questions in a subcategory to advance
    - 2 wrong at same level to go down (unless at foundational)
    """
    
    # Difficulty progression order (Foundational -> Competent -> Proficient -> Advanced)
    DIFFICULTY_ORDER = [
        DifficultyLevel.EASY,      # 1 - Foundational
        DifficultyLevel.MEDIUM,    # 2 - Competent
        DifficultyLevel.HARD,      # 3 - Proficient
        DifficultyLevel.EXTREME    # 4 - Advanced
    ]
    
    # Rules - Updated for 3/4 system
    LEVEL_UP_CORRECT_REQUIRED = 3  # 3 correct from last 4
    LEVEL_UP_WINDOW = 4            # Window of 4 questions
    LEVEL_DOWN_WRONG_THRESHOLD = 2 # 2 wrong at same level to go down
    
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
        1. Update category/subcategory progress
        2. Apply 3/4 correct to advance, 2 wrong to go down rule
        3. Update overall statistics
        """
        category = question.category.value
        subcategory = question.subcategory if hasattr(question, 'subcategory') and question.subcategory else category
        
        # Create a combined key for category+subcategory tracking
        tracking_key = f"{category}:{subcategory}"
        
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
        
        # Track per-subcategory progress for complexity rules
        # Store recent answers per subcategory+level in a separate tracking dict
        if not hasattr(progress, 'subcategory_tracking') or progress.subcategory_tracking is None:
            progress.subcategory_tracking = {}
        
        current_level = cat_progress.current_difficulty.value
        level_key = f"{tracking_key}:{current_level}"
        
        if level_key not in progress.subcategory_tracking:
            progress.subcategory_tracking[level_key] = {
                'recent_answers': [],  # List of booleans (True=correct, False=wrong)
                'wrong_count_at_level': 0
            }
        
        tracking = progress.subcategory_tracking[level_key]
        
        # Add this answer to recent answers (keep only last LEVEL_UP_WINDOW)
        tracking['recent_answers'].append(answer.is_correct)
        if len(tracking['recent_answers']) > self.LEVEL_UP_WINDOW:
            tracking['recent_answers'] = tracking['recent_answers'][-self.LEVEL_UP_WINDOW:]
        
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
            tracking['wrong_count_at_level'] += 1
        
        # Apply adaptive difficulty logic
        cat_progress, level_changed = self._apply_adaptive_logic(
            cat_progress, 
            tracking,
            answer.is_correct
        )
        
        # If level changed, reset tracking for new level
        if level_changed:
            new_level_key = f"{tracking_key}:{cat_progress.current_difficulty.value}"
            if new_level_key not in progress.subcategory_tracking:
                progress.subcategory_tracking[new_level_key] = {
                    'recent_answers': [],
                    'wrong_count_at_level': 0
                }
            # Reset wrong count for old level
            tracking['wrong_count_at_level'] = 0
        
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
        tracking: dict,
        is_correct: bool
    ) -> tuple:
        """Apply complexity progression rules:
        - 3 correct from last 4 questions to advance
        - 2 wrong at same level to go down (unless at foundational)
        
        Returns: (updated_progress, level_changed)
        """
        current_index = self.DIFFICULTY_ORDER.index(cat_progress.current_difficulty)
        level_changed = False
        
        recent = tracking['recent_answers']
        
        # Check for level UP: 3 correct from last 4
        if len(recent) >= self.LEVEL_UP_WINDOW:
            correct_count = sum(recent[-self.LEVEL_UP_WINDOW:])
            if correct_count >= self.LEVEL_UP_CORRECT_REQUIRED:
                if current_index < len(self.DIFFICULTY_ORDER) - 1:
                    cat_progress.current_difficulty = self.DIFFICULTY_ORDER[current_index + 1]
                    level_changed = True
                    print(f"Level UP! Now at {cat_progress.current_difficulty.value} (got {correct_count}/{self.LEVEL_UP_WINDOW} correct)")
        
        # Check for level DOWN: 2 wrong at same level
        if not level_changed and tracking['wrong_count_at_level'] >= self.LEVEL_DOWN_WRONG_THRESHOLD:
            if current_index > 0:  # Don't go below foundational
                cat_progress.current_difficulty = self.DIFFICULTY_ORDER[current_index - 1]
                level_changed = True
                print(f"Level DOWN! Now at {cat_progress.current_difficulty.value} (got {tracking['wrong_count_at_level']} wrong)")
        
        cat_progress.last_updated = datetime.utcnow()
        return cat_progress, level_changed
    
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