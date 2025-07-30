from django.contrib import admin
from .models import Contacts

@admin.register(Contacts)
class ContactsAdmin(admin.ModelAdmin):
    list_display = ('facebook_page', 'instagram_page', 'whatsapp_number', 'email','address')
    
    fieldsets = (
        ('Социальные сети', {
            'fields': ('facebook_page', 'instagram_page'),
            'description': 'Ссылки на страницы в социальных сетях'
        }),
        ('Контактная информация', {
            'fields': ('whatsapp_number', 'email','address'),
            'description': 'Контактные данные для связи'
        }),
    )
    
    # Убираем возможность удаления записей
    def has_delete_permission(self, request, obj=None):
        return False
    
    # Ограничиваем количество записей до одной
    def has_add_permission(self, request):
        return not Contacts.objects.exists()
    
    # Настройки для удобства
    save_on_top = True
    
    class Media:
        css = {
            'all': ('admin/css/custom_contacts.css',)
        }
