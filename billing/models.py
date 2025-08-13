from django.db import models
from user.models import User
from games.models import Reservation
from django.utils import timezone
import random
from billing.utils import check_invoice_id
import uuid

class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_id = models.CharField(unique=True, max_length=30, editable=False)
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    reservation = models.ForeignKey(Reservation, on_delete=models.SET_NULL, null=True, blank=True)
    
    payment_method = models.CharField(max_length=30, null=True, blank=True, default='stripe')
    callback_url = models.URLField(max_length=255, null=True, blank=True)
    cancel_url = models.URLField(max_length=255, null=True, blank=True)
    
    currency = models.CharField(max_length=5, default='EUR')
    discount = models.FloatField(null=True, blank=True)
    invoice_date = models.DateField(default=timezone.now)
    
    payment_type = models.CharField(max_length=20, default='online')
    total = models.DecimalField(decimal_places=2, max_digits=8)
    invoice_type = models.CharField(max_length=20, default='one_time')
    
    def total_display(self):
        return f'{self.total} {self.get_currency_display()}'
    
    def get_payment_status(self):
        if self.payments.first():
            return self.payments.first().status.capitalize()
        else:
            return None
    
    def save(self, *args, **kwargs):
        if not self.invoice_id:
            number = random.randint(100000, 999999)
            count = Invoice.objects.filter(
                invoice_date__month=self.invoice_date.month,
                invoice_date__year=self.invoice_date.year
            ).count() + 1
            self.invoice_id = f"{self.invoice_date.strftime('%m')}{self.invoice_date.strftime('%y')}{count:05d}00{number}"
            self.invoice_id = check_invoice_id(self.invoice_id)
        super(Invoice, self).save(*args, **kwargs)
    
    def create_payment(self):
        # FIXED: Use correct field name 'invoice' instead of 'invoice_id'
        instance = Payment.objects.create(
            invoice=self,  # ✅ Correct FK reference
            amount=self.total,
            currency=self.currency,
            callback_url=self.callback_url,
            cancel_url=self.cancel_url,
            payment_gateway=self.payment_method
        )
        return instance
    
    def __str__(self):
        return self.invoice_id
    
class Payment(models.Model):
    amount = models.DecimalField(max_digits=5, decimal_places=2)
    currency = models.CharField(max_length=5)

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, null=True, related_name='payments')

    reference = models.CharField(max_length=100, null=True, blank=True)

    payment_gateway = models.CharField(max_length=100, default='stripe')

    payment_type = models.CharField(max_length=100, default='online')

    url = models.URLField(null=True, blank=True)

    STATUSES = (
        ('pending', 'Pending'),
        ('receivable', 'Receivable'),
        ('failed', 'Failed'),
        ('timeout', 'Timeout'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
        ('reversed', 'Reversed'),
    )

    status = models.CharField(max_length=20, choices=STATUSES, default='pending')
    details = models.JSONField(null=True, blank=True)

    callback_url = models.URLField(max_length=255, null=True, blank=True)
    cancel_url = models.URLField(max_length=255, null=True, blank=True)



    paid_date = models.DateField(null=True, blank=True)

    def get_callback_url(self):
        if self.callback_url:
            return self.callback_url
        else:
            return 'mycareerwise.ai'

    def __str__(self):
        return f'Payment #{self.pk}'
