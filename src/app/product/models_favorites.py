from django.db import models

class Favorite(models.Model):
    """Избранные товары пользователя"""
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='favorited_by')
    
    # Сохраняем цену при добавлении в избранное для отслеживания изменений
    initial_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'product']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name}"


class ProductPriceHistory(models.Model):
    """История изменения цен товара"""
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='price_history')
    old_price = models.DecimalField(max_digits=10, decimal_places=2)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.product.name}: {self.old_price} → {self.new_price}"
