from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, ScholarProfile, StudyDetails, Publication,
    Challenge, GrowthSuggestion, FundingOpportunity,
    Award, Workshop, InstitutionalContent, AuditLog
)

class ScholarProfileInline(admin.StackedInline):
    model = ScholarProfile
    can_delete = False
    verbose_name_plural = 'Scholar Profile'

class StudyDetailsInline(admin.StackedInline):
    model = StudyDetails
    can_delete = False
    verbose_name_plural = 'Study Details'

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Society Role', {'fields': ('role',)}),
    )
    inlines = [ScholarProfileInline, StudyDetailsInline]

@admin.register(ScholarProfile)
class ScholarProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'faculty', 'student_number')
    list_filter = ('category', 'faculty')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'student_number')

@admin.register(StudyDetails)
class StudyDetailsAdmin(admin.ModelAdmin):
    list_display = ('user', 'programme', 'year_of_starting', 'anticipated_year_of_completion', 'supervisor')
    search_fields = ('user__username', 'programme', 'supervisor', 'research_topic')

@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'publication_type', 'outlet_name', 'year', 'status')
    list_filter = ('publication_type', 'status', 'year')
    search_fields = ('title', 'authors', 'user__username', 'outlet_name')

@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'status', 'created_at', 'resolved_at')
    list_filter = ('status', 'category')
    search_fields = ('title', 'description', 'user__username')

@admin.register(GrowthSuggestion)
class GrowthSuggestionAdmin(admin.ModelAdmin):
    list_display = ('user', 'growth_objective', 'area', 'target_quarter', 'is_completed')
    list_filter = ('area', 'is_completed')

@admin.register(FundingOpportunity)
class FundingOpportunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'funder', 'amount_range', 'deadline', 'featured_on_landing', 'is_active')
    list_filter = ('is_active', 'featured_on_landing')

@admin.register(Award)
class AwardAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'awarding_body', 'year')
    list_filter = ('year',)

@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ('title', 'facilitator', 'event_date', 'event_time', 'venue_or_link')
    list_filter = ('event_date', 'category')

@admin.register(InstitutionalContent)
class InstitutionalContentAdmin(admin.ModelAdmin):
    list_display = ('key', 'title', 'updated_at', 'last_updated_by')

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'action', 'actor_username', 'actor_role', 'ip_address')
    list_filter = ('action', 'actor_role')
    readonly_fields = ('timestamp', 'action', 'actor_username', 'actor_role', 'target_object', 'details', 'ip_address')
