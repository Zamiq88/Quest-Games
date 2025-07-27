from django.conf import settings
import json
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)

def clean_gemini_response(response_text):
    if response_text.startswith('```json'):
        response_text = response_text[7:]
    if response_text.endswith('```'):
        response_text = response_text[:-3]
        
        # Remove any leading/trailing whitespace
    response_text = response_text.strip()
        
        # Try to extract JSON from the response if it's embedded in other text
    import re
    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
    if json_match:
        response_text = json_match.group()
        
    return response_text

class GeminiTranslationService:
    def __init__(self):
        if hasattr(settings, 'GEMINI_API_KEY'):
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        else:
            logger.error("GEMINI_API_KEY not found in settings")
            self.model = None
    
    def translate_game_content(self, game):
        """Translate game title and description to multiple languages"""
        if not self.model:
            logger.error("Gemini model not initialized")
            return False
        
        try:
            # Get Russian content
            ru_title = game.title.get('ru', '')
            ru_description = game.description.get('ru', '')
            
            if not ru_title or not ru_description:
                logger.warning(f"Missing Russian content for game {game.id}")
                return False
            
            # Languages to translate to
            target_languages = {
                'en': 'English',
                'es': 'Spanish', 
                'uk': 'Ukrainian'
            }
            
            # Prepare current title and description dictionaries
            if not isinstance(game.title, dict):
                game.title = {'ru': ru_title}
            if not isinstance(game.description, dict):
                game.description = {'ru': ru_description}
            
            # Translate to each language
            for lang_code, lang_name in target_languages.items():
                try:
                    # Skip if translation already exists
                    if game.title.get(lang_code) and game.description.get(lang_code):
                        continue
                    
                    # Create translation prompt
                    prompt = f"""
                    You are a professional translator specializing in escape room and quest game descriptions.
                    
                    Please translate the following escape room game content from Russian to {lang_name}.
                    Maintain the excitement and marketing appeal of the original text.
                    Keep the same tone and style suitable for adventure gaming.
                    
                    Title (Russian): {ru_title}
                    Description (Russian): {ru_description}
                    
                    Please provide the translation in JSON format:
                    {{
                        "title": "translated title here",
                        "description": "translated description here"
                    }}
                    
                    Important: Return only valid JSON, no additional text or formatting.
                    """
                    
                    # Get translation from Gemini
                    response = self.model.generate_content(prompt)
                    
                    if response and response.text:
                        # Parse JSON response
                        response_text = clean_gemini_response(response_text=response.text)
                        try:
                            translation_data = json.loads(response_text.strip())
                            
                            # Update game with translations
                            if 'title' in translation_data and translation_data['title']:
                                game.title[lang_code] = translation_data['title']
                            
                            if 'description' in translation_data and translation_data['description']:
                                game.description[lang_code] = translation_data['description']
                                
                            logger.info(f"Successfully translated game {game.id} to {lang_name}")
                            
                        except json.JSONDecodeError as e:
                            logger.error(f"Failed to parse JSON response for {lang_name}: {e}")
                            logger.error(f"Response was: {response.text}")
                            continue
                    
                except Exception as e:
                    logger.error(f"Error translating to {lang_name}: {e}")
                    continue
            
            # Save the updated game
            game.translation_status = 'completed'
            game.save(update_fields=['title', 'description', 'translation_status'])
            
            logger.info(f"Translation completed for game {game.id}")
            return True
            
        except Exception as e:
            logger.error(f"Error in translate_game_content: {e}")
            game.translation_status = 'failed'
            game.save(update_fields=['translation_status'])
            return False
