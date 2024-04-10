from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_admin = models.BooleanField(default = False)

    def serialize(self): #serialize meaning convert it into JSON.
        user = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_admin': bool(self.is_admin),
        }

        return user


class Shift(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name='user_shifts')
    start = models.TimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    end = models.TimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    date = models.DateField(auto_now=False, auto_now_add=False)
    is_oncall = models.BooleanField(default = False)
    is_off = models.BooleanField(default = False)

    class Meta:
        unique_together = ['user', 'date'] #there can only be one Shift entry for a specific user on a specific date

    def clean(self):
        if not self.is_off and (self.start is None or self.end is None):
            raise ValidationError("Start and end time are required for shifts that are not marked as off.")

    def serialize(self):
        data = {
            "id": self.id,
            "user": self.user.serialize(),
            "start": self.start,
            "end" : self.end,
            "date" : self.date,
            "is-oncall" : bool(self.is_oncall),
            "is-off" : bool(self.is_off)
        }

        return data
