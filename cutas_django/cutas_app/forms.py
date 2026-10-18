from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm
from .models import (
    User, ScholarProfile, StudyDetails, Publication, Challenge,
    GrowthSuggestion, FundingOpportunity, Award, Workshop, InstitutionalContent
)

class ScholarRegistrationForm(UserCreationForm):
    first_name = forms.CharField(max_length=100, required=True)
    last_name = forms.CharField(max_length=100, required=True)
    email = forms.EmailField(required=True)
    category = forms.ChoiceField(choices=ScholarProfile.Category.choices, required=True)
    faculty = forms.CharField(max_length=150, required=True, initial='Faculty of Engineering, Built Environment & Information Technology')
    student_number = forms.CharField(max_length=30, required=True)

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = User.Role.SCHOLAR
        if commit:
            user.save()
            ScholarProfile.objects.create(
                user=user,
                category=self.cleaned_data['category'],
                faculty=self.cleaned_data['faculty'],
                student_number=self.cleaned_data['student_number']
            )
            # Create default empty study details
            StudyDetails.objects.create(
                user=user,
                programme="Postgraduate Degree",
                university="Central University of Technology, Free State",
                supervisor="To be updated",
                research_topic="Research Topic",
                research_abstract="Abstract in formulation"
            )
        return user


class ScholarProfileForm(forms.ModelForm):
    class Meta:
        model = ScholarProfile
        fields = [
            'title', 'category', 'faculty', 'department', 'student_number',
            'phone_number', 'bio', 'cv_summary_text', 'profile_picture', 'cv_file'
        ]
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 4, 'class': 'w-full'}),
            'cv_summary_text': forms.Textarea(attrs={'rows': 6, 'class': 'w-full'}),
        }


class StudyDetailsForm(forms.ModelForm):
    class Meta:
        model = StudyDetails
        fields = [
            'programme', 'university', 'year_of_starting', 'anticipated_year_of_completion',
            'supervisor', 'co_supervisor', 'funding', 'research_topic', 'research_abstract'
        ]
        widgets = {
            'research_abstract': forms.Textarea(attrs={'rows': 6}),
        }


class PublicationForm(forms.ModelForm):
    class Meta:
        model = Publication
        fields = [
            'publication_type', 'title', 'authors', 'outlet_name',
            'year', 'volume_issue_pages', 'doi_or_url', 'status'
        ]


class ChallengeForm(forms.ModelForm):
    class Meta:
        model = Challenge
        fields = ['category', 'title', 'description']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 5, 'placeholder': 'Describe your scholarly challenge in detail...'}),
        }


class ChallengeResolutionForm(forms.ModelForm):
    class Meta:
        model = Challenge
        fields = ['status', 'resolution_notes']
        widgets = {
            'resolution_notes': forms.Textarea(attrs={'rows': 5, 'placeholder': 'Provide intervention steps, referrals, or resolution details...'}),
        }


class GrowthSuggestionForm(forms.ModelForm):
    class Meta:
        model = GrowthSuggestion
        fields = ['area', 'growth_objective', 'milestone_actions', 'target_quarter', 'is_completed']
        widgets = {
            'milestone_actions': forms.Textarea(attrs={'rows': 4}),
        }


class AwardForm(forms.ModelForm):
    class Meta:
        model = Award
        fields = ['title', 'awarding_body', 'year', 'description']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }


class FundingOpportunityForm(forms.ModelForm):
    class Meta:
        model = FundingOpportunity
        fields = [
            'title', 'funder', 'amount_range', 'deadline',
            'eligibility', 'application_process', 'portal_url',
            'featured_on_landing', 'is_active'
        ]
        widgets = {
            'deadline': forms.DateInput(attrs={'type': 'date'}),
            'eligibility': forms.Textarea(attrs={'rows': 4}),
            'application_process': forms.Textarea(attrs={'rows': 4}),
        }


class WorkshopForm(forms.ModelForm):
    class Meta:
        model = Workshop
        fields = ['title', 'facilitator', 'event_date', 'event_time', 'venue_or_link', 'category', 'description']
        widgets = {
            'event_date': forms.DateInput(attrs={'type': 'date'}),
            'event_time': forms.TimeInput(attrs={'type': 'time'}),
            'description': forms.Textarea(attrs={'rows': 4}),
        }


class InstitutionalContentForm(forms.ModelForm):
    class Meta:
        model = InstitutionalContent
        fields = ['title', 'headline', 'body']
        widgets = {
            'body': forms.Textarea(attrs={'rows': 10}),
        }


class AccountDeletionForm(forms.Form):
    confirmation = forms.CharField(
        max_length=20,
        required=True,
        help_text="Type DELETE to permanently remove your CUTAS account and associated records."
    )

    def clean_confirmation(self):
        val = self.cleaned_data.get('confirmation', '').strip()
        if val != 'DELETE':
            raise forms.ValidationError("You must type exactly 'DELETE' to confirm account deletion.")
        return val
