from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Game
from . services import GeminiTranslationService
import logging
logger = logging.getLogger(__name__)


@receiver(post_save, sender=Game)
def handle_game_translation(sender, instance, created, **kwargs):
    """Handle automatic translation when game is created or updated"""
    
    # Skip if this save was triggered by translation update
    if hasattr(instance, '_skip_translation'):
        return
    
    # Only process if game needs translation
    if not instance.needs_translation():
        return
    
    # Update translation status to processing
    if instance.translation_status != 'processing':
        instance.translation_status = 'processing'
        instance._skip_translation = True
        instance.save(update_fields=['translation_status'])
    
    # Perform translation in background (you might want to use Celery for this)
    try:
        translation_service = GeminiTranslationService()
        success = translation_service.translate_game_content(instance)
        
        if not success:
            instance.translation_status = 'failed'
            instance._skip_translation = True
            instance.save(update_fields=['translation_status'])
            
    except Exception as e:
        logger.error(f"Error in translation signal handler: {e}")
        instance.translation_status = 'failed'
        instance._skip_translation = True
        instance.save(update_fields=['translation_status'])