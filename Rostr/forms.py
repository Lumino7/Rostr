from datetime import datetime
from django import forms
from .models import Shift, User

class ShiftForm(forms.ModelForm):
    start = forms.TimeField(widget=forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}), label='Start time')
    end = forms.TimeField(widget=forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}), label='End time')
    is_oncall = forms.BooleanField(required=False, widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}), label='On-call')
    is_off = forms.BooleanField(required=False, widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}), label='Off')

    def __init__(self, *args, **kwargs): #modifies the constructor
        super().__init__(*args, **kwargs)
        if 'is_off' in self.data:
            is_off = self.data.get('is_off')
        elif self.instance and self.instance.pk:
            is_off = self.instance.is_off
        else:
            is_off = False

        if is_off:
            self.fields['start'].required = False
            self.fields['end'].required = False
        else:
            self.fields['start'].required = True
            self.fields['end'].required = True

    class Meta:
        model = Shift
        fields = ['start', 'end', 'is_oncall', 'is_off']

    def clean(self): #adds some checks to the form validation
        cleaned_data = super().clean()
        is_off = cleaned_data.get('is_off')
        start = cleaned_data.get('start')
        end = cleaned_data.get('end')

        if not is_off:
            if not start:
                self.add_error('start', 'Start time is required.')
            if not end:
                self.add_error('end', 'End time is required.')
            if start and end and start >= end:
                self.add_error('end', 'End time must be greater than start time.')

        return cleaned_data

    def save(self, commit=True, user=None, date=None): #modifies the save method.
        instance = super(ShiftForm, self).save(commit=False)

        if user is not None:
            instance.user = user

        if date is not None:
            instance.date = date

        if commit:
            instance.save() #.save(commit=True) commit is default true

        return instance
