from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Game
from . services import GeminiTranslationService

from django.contrib import admin
from django.forms import ModelForm, CharField, Textarea
from django.utils.html import format_html

class GameAdminForm(ModelForm):
    # Custom form fields for Russian input
    title_ru = CharField(
        label='Название игры (Русский)',
        max_length=50,
        help_text='Введите название квест-игры на русском языке',
        required=True
    )
    
    description_ru = CharField(
        label='Описание (Русский)',
        widget=Textarea(attrs={'rows': 4}),
        max_length=500,
        help_text='Детальное описание игры для клиентов на русском языке',
        required=True
    )
    
    class Meta:
        model = Game
        fields = '__all__'
        exclude = ['title', 'description']  # Hide JSON fields from form
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Populate Russian fields if editing existing game
        if self.instance and self.instance.pk:
            if isinstance(self.instance.title, dict):
                self.fields['title_ru'].initial = self.instance.title.get('ru', '')
            if isinstance(self.instance.description, dict):
                self.fields['description_ru'].initial = self.instance.description.get('ru', '')
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        
        # Save Russian content to JSON fields
        if not isinstance(instance.title, dict):
            instance.title = {}
        if not isinstance(instance.description, dict):
            instance.description = {}
        
        instance.title['ru'] = self.cleaned_data['title_ru']
        instance.description['ru'] = self.cleaned_data['description_ru']
        
        if commit:
            instance.save()
        return instance


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    form = GameAdminForm
    
    list_display = [
        'get_title_display', 'category', 'difficulty', 'price', 
        'is_featured', 'is_active', 'get_translation_status'
    ]
    
    list_filter = [
        'category', 'difficulty', 'status', 'is_featured', 
        'is_active', 'translation_status'
    ]
    
    search_fields = ['title__ru']  # Search in Russian titles
    
    readonly_fields = ['translation_status', 'created_at', 'updated_at', 'get_translations_display']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title_ru', 'description_ru', 'category', 'difficulty', 'status', 'image')
        }),
        ('Детали игры', {
            'fields': ('price', 'max_players', 'duration')
        }),
        ('Рабочие часы', {
            'fields': ('working_hours_start', 'working_hours_end')
        }),
        ('Настройки', {
            'fields': ('is_featured', 'is_active')
        }),
        ('Переводы', {
            'fields': ('translation_status', 'get_translations_display'),
            'classes': ('collapse',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_title_display(self, obj):
        return obj.get_title('ru') or "Без названия"
    get_title_display.short_description = 'Название'
    
    def get_translation_status(self, obj):
        status_colors = {
            'pending': 'orange',
            'processing': 'blue', 
            'completed': 'green',
            'failed': 'red'
        }
        color = status_colors.get(obj.translation_status, 'gray')
        return format_html(
            '<span style="color: {};">{}</span>',
            color,
            obj.get_translation_status_display()
        )
    get_translation_status.short_description = 'Статус перевода'
    
    def get_translations_display(self, obj):
        if not isinstance(obj.title, dict):
            return "Нет переводов"
        
        translations = []
        languages = {'ru': 'Русский', 'en': 'English', 'es': 'Español', 'uk': 'Українська'}
        
        for lang_code, lang_name in languages.items():
            if obj.title.get(lang_code):
                translations.append(f"<strong>{lang_name}:</strong> {obj.title[lang_code][:50]}...")
        
        return format_html("<br>".join(translations)) if translations else "Нет переводов"
    get_translations_display.short_description = 'Доступные переводы'
    
    actions = ['retranslate_games']
    
    def retranslate_games(self, request, queryset):
        """Admin action to retranslate selected games"""
        translation_service = GeminiTranslationService()
        success_count = 0
        
        for game in queryset:
            if translation_service.translate_game_content(game):
                success_count += 1
        
        self.message_user(
            request,
            f'Успешно переведено {success_count} из {queryset.count()} игр.'
        )
    retranslate_games.short_description = 'Перевести выбранные игры заново'