from django.contrib import admin
from .models import Challenge, InitialDataPoint


class InitialDataPointInline(admin.TabularInline):
    model = InitialDataPoint
    extra = 1
    fields = ['label', 'initial_x', 'initial_y', 'initial_z', 'order']


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ['title', 'rule_operator', 'rule_value_a', 'rule_value_b', 'created_at']
    list_filter = ['rule_operator', 'created_at']
    search_fields = ['title', 'instruction_text']
    inlines = [InitialDataPointInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'instruction_text')
        }),
        ('Validation Rules', {
            'fields': ('rule_operator', 'rule_value_a', 'rule_value_b'),
            'description': 'Define the range validation rules for this challenge.'
        }),
    )


@admin.register(InitialDataPoint)
class InitialDataPointAdmin(admin.ModelAdmin):
    list_display = ['label', 'challenge', 'initial_x', 'initial_y', 'initial_z', 'order']
    list_filter = ['challenge']
    search_fields = ['label', 'challenge__title']
    ordering = ['challenge', 'order', 'id']
