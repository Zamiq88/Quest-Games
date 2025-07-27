from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Game
from . models import CATEGORY_CHOICES,STATUS_CHOICES,DIFFICULTY_CHOICES

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    # List view configuration
    list_display = [
        'title_with_status',
        'category_display',
        'difficulty_display',
        'status_display',
        'price_display', 
        'max_players', 
        'duration_display', 
        'working_hours_display',
        'image_preview',
        'is_active',
        'created_at',
        'is_featured',
        'status',
        'difficulty'

    ]
    
    list_filter = [
        'is_active',
        'is_featured',
        'difficulty',
        'status',
        'category',
        'max_players',
        'working_hours_start',
        'working_hours_end',
        'created_at'
    ]
    
    search_fields = ['title', 'description']
    
    list_editable = ['is_active', 'is_featured', 'status', 'difficulty']  # Quick edit from list view
    
    # Fieldsets for organized form
    fieldsets = (
        (_('📋 Основная информация'), {
            'fields': ('title', 'description', 'category', 'difficulty', 'status', 'image'),
            'description': _('Основные данные об квест-игре')
        }),
        (_('💰 Параметры игры'), {
            'fields': ('price', 'max_players', 'duration'),
            'description': _('Стоимость и характеристики игры')
        }),
        (_('🕐 Режим работы'), {
            'fields': ('working_hours_start', 'working_hours_end'),
            'description': _('Установите время работы для этой игры')
        }),
        (_('⚙️ Настройки отображения'), {
            'fields': ('is_featured', 'is_active'),
            'description': _('Управление видимостью игры на сайте')
        }),
    )
    
    # Configuration
    save_on_top = True
    ordering = ['-is_featured', 'category', 'title']
    list_per_page = 20
    
    # Actions
    actions = ['make_featured', 'remove_featured', 'activate_games', 'deactivate_games', 
               'set_available_now', 'set_pre_reservation', 'set_easy', 'set_medium', 'set_hard']
    
    def make_featured(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f'Отмечено как рекомендуемые: {count} игр(ы)')
    make_featured.short_description = _("Отметить как рекомендуемые")
    
    def remove_featured(self, request, queryset):
        count = queryset.update(is_featured=False)
        self.message_user(request, f'Убрано из рекомендуемых: {count} игр(ы)')
    remove_featured.short_description = _("Убрать из рекомендуемых")
    
    def activate_games(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'Активировано: {count} игр(ы)')
    activate_games.short_description = _("Активировать игры")
    
    def deactivate_games(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'Деактивировано: {count} игр(ы)')
    deactivate_games.short_description = _("Деактивировать игры")
    
    def set_available_now(self, request, queryset):
        count = queryset.update(status='available_now')
        self.message_user(request, f'Установлен статус "Доступно сейчас": {count} игр(ы)')
    set_available_now.short_description = _("Установить статус: Доступно сейчас")
    
    def set_pre_reservation(self, request, queryset):
        count = queryset.update(status='pre_reservation')
        self.message_user(request, f'Установлен статус "Предварительное бронирование": {count} игр(ы)')
    set_pre_reservation.short_description = _("Установить статус: Предварительное бронирование")
    
    def set_easy(self, request, queryset):
        count = queryset.update(difficulty='easy')
        self.message_user(request, f'Установлена сложность "Легкий": {count} игр(ы)')
    set_easy.short_description = _("Установить сложность: Легкий")
    
    def set_medium(self, request, queryset):
        count = queryset.update(difficulty='medium')
        self.message_user(request, f'Установлена сложность "Средний": {count} игр(ы)')
    set_medium.short_description = _("Установить сложность: Средний")
    
    def set_hard(self, request, queryset):
        count = queryset.update(difficulty='hard')
        self.message_user(request, f'Установлена сложность "Сложный": {count} игр(ы)')
    set_hard.short_description = _("Установить сложность: Сложный")
    
    # Custom display methods
    def title_with_status(self, obj):
        """Display title with status indicators"""
        title = obj.title
        if obj.is_featured:
            title = f"⭐ {title}"
        if not obj.is_active:
            title = f"❌ {title}"
        return title
    title_with_status.short_description = _("Название")
    
    def category_display(self, obj):
        """Display category with icon"""
        category_icons = {
            'escape': '🔓',
            'adventure': '🗺️',
            'puzzle': '🧩',
            'horror': '👻',
            'team': '👥'
        }
        icon = category_icons.get(obj.category, '🎮')
        category_name = dict(CATEGORY_CHOICES).get(obj.category, obj.category)
        return f"{icon} {category_name}"
    category_display.short_description = _("Категория")
    category_display.admin_order_field = 'category'
    
    def status_display(self, obj):
        """Display status with icon"""
        status_icons = {
            'available_now': '✅',
            'pre_reservation': '📅'
        }
        icon = status_icons.get(obj.status, '❓')
        status_name = dict(STATUS_CHOICES).get(obj.status, obj.status)
        return f"{icon} {status_name}"
    status_display.short_description = _("Статус")
    status_display.admin_order_field = 'status'
    
    def difficulty_display(self, obj):
        """Display difficulty with icon"""
        difficulty_icons = {
            'easy': '🟢',      # Green circle for easy
            'medium': '🟡',    # Yellow circle for medium  
            'hard': '🔴'       # Red circle for hard
        }
        icon = difficulty_icons.get(obj.difficulty, '⚪')
        difficulty_name = dict(DIFFICULTY_CHOICES).get(obj.difficulty, obj.difficulty)
        return f"{icon} {difficulty_name}"
    difficulty_display.short_description = _("Сложность")
    difficulty_display.admin_order_field = 'difficulty'
    
    def price_display(self, obj):
        """Display price with currency"""
        if obj.price:
            return f"{obj.price} €"  # Euro currency for Spain
        return _("Не указано")
    price_display.short_description = _("Цена")
    price_display.admin_order_field = 'price'
    
    def duration_display(self, obj):
        """Display duration in readable format"""
        if obj.duration:
            hours = obj.duration // 60
            minutes = obj.duration % 60
            if hours > 0 and minutes > 0:
                return f"{hours}ч {minutes}м"
            elif hours > 0:
                return f"{hours}ч"
            else:
                return f"{minutes}м"
        return _("Не указано")
    duration_display.short_description = _("Длительность")
    duration_display.admin_order_field = 'duration'
    
    def working_hours_display(self, obj):
        """Display working hours"""
        if obj.working_hours_start and obj.working_hours_end:
            return f"🕐 {obj.working_hours_start} - {obj.working_hours_end}"
        return _("Не указано")
    working_hours_display.short_description = _("Время работы")
    
    def image_preview(self, obj):
        """Show image preview"""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;" alt="{}" />',
                obj.image.url,
                obj.title
            )
        return _("❌ Нет изображения")
    image_preview.short_description = _("Изображение")

# Customize admin site
admin.site.site_header = _("🎮 Админ-панель Квест-игр")
admin.site.site_title = _("Квест-игры")
admin.site.index_title = _("Добро пожаловать в систему управления квест-играми!")
