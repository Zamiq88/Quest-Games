from django.db import models
from django.utils.translation import gettext_lazy as _
from user.models import User

HOUR_CHOICES = (
    ('00:00', '00:00'), ('01:00', '01:00'), ('02:00', '02:00'), ('03:00', '03:00'),
    ('04:00', '04:00'), ('05:00', '05:00'), ('06:00', '06:00'), ('07:00', '07:00'),
    ('08:00', '08:00'), ('09:00', '09:00'), ('10:00', '10:00'), ('11:00', '11:00'),
    ('12:00', '12:00'), ('13:00', '13:00'), ('14:00', '14:00'), ('15:00', '15:00'),
    ('16:00', '16:00'), ('17:00', '17:00'), ('18:00', '18:00'), ('19:00', '19:00'),
    ('20:00', '20:00'), ('21:00', '21:00'), ('22:00', '22:00'), ('23:00', '23:00'),
)

CATEGORY_CHOICES = (
    ('escape', _('Побег')),
    ('adventure', _('Приключения')),
    ('puzzle', _('Головоломки')),
    ('horror', _('Хоррор')),
    ('team', _('Командные')),
)

STATUS_CHOICES = (
    ('available_now', _('Доступно сейчас')),
    ('pre_reservation', _('Предварительное бронирование')),
)
DIFFICULTY_CHOICES = [
    ('easy', _('Легкий')),
    ('medium', _('Средний')),
    ('hard', _('Сложный')),
]

class Game(models.Model):
    # Basic game information
    title = models.CharField(
        max_length=50, 
        verbose_name=_('Название игры'),
        help_text=_('Введите название квест-игры')
    )
    
    description = models.TextField(  # Changed to TextField for longer descriptions
        max_length=500, 
        verbose_name=_('Описание'),
        help_text=_('Детальное описание игры для клиентов')
    )
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='escape',
        verbose_name=_('Категория'),
        help_text=_('Выберите категорию игры')
    )
    difficulty = models.CharField(
    max_length=10,
    choices=DIFFICULTY_CHOICES,
    default='medium',
    verbose_name=_('Сложность'),
    help_text=_('Уровень сложности игры')
)
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='available_now',
        verbose_name=_('Статус'),
        help_text=_('Статус доступности игры для бронирования')
    )
    
    image = models.ImageField(
        upload_to='games/', 
        verbose_name=_('Изображение'),
        help_text=_('Загрузите привлекательное изображение игры (рекомендуется 800x600)')
    )
    
    # Game details
    price = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        verbose_name=_('Цена'),
        help_text=_('Цена за игру в евро (EUR)')
    )
    
    max_players = models.PositiveIntegerField(
        verbose_name=_('Максимум игроков'),
        help_text=_('Максимальное количество игроков одновременно')
    )
    
    duration = models.PositiveIntegerField(
        verbose_name=_('Продолжительность (мин)'),
        help_text=_('Длительность игры в минутах')
    )
    
    # Working hours
    working_hours_start = models.CharField(
        max_length=15,
        choices=HOUR_CHOICES,
        verbose_name=_('Начало работы'),
        help_text=_('Время открытия для этой игры')
    )
    
    working_hours_end = models.CharField(
        max_length=15,
        choices=HOUR_CHOICES,
        verbose_name=_('Конец работы'),
        help_text=_('Время закрытия для этой игры')
    )
    
    # Additional fields for better management
    is_featured = models.BooleanField(
        default=False,
        verbose_name=_('Рекомендуемая игра'),
        help_text=_('Показывать на главной странице как рекомендуемую')
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Активная'),
        help_text=_('Доступна для бронирования клиентами')
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Дата создания')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Дата обновления')
    )

    class Meta:
        verbose_name = _('Квест-игра')
        verbose_name_plural = _('Квест-игры')
        ordering = ['-is_featured', 'category', 'title']

    def __str__(self):
        featured_mark = " ⭐" if self.is_featured else ""
        active_mark = "" if self.is_active else " (неактивная)"
        return f"{self.title}{featured_mark}{active_mark}"
    
class Reservation(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    game = models.ForeignKey(Game,on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
