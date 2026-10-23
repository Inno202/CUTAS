# Changes to apply to cutas_app/models.py (migration 0002 already contains them)

1. Above `class User`, add:

    class PublishStatus(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        PUBLISHED = 'PUBLISHED', _('Published')

2. Add to FundingOpportunity, Workshop and InstitutionalContent:

    status = models.CharField(max_length=10, choices=PublishStatus.choices, default=PublishStatus.PUBLISHED)

3. AuditLog:
    - `action = models.CharField(max_length=40, db_index=True)`   (remove ACTION_CHOICES: new actions no longer need a migration)
    - `actor_role = models.CharField(max_length=60)`              (was 30; "Super Administrator (Developer/Lead)" is 36 chars and crashed on Postgres)
    - `timestamp = models.DateTimeField(auto_now_add=True, db_index=True)`

Then: python manage.py makemigrations --check   (should report no changes)
