# Generated by Django 5.0.2 on 2024-02-23 15:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Rostr", "0003_shift_date_alter_shift_end_alter_shift_start"),
    ]

    operations = [
        migrations.AddField(
            model_name="shift",
            name="is_off",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="shift",
            name="is_oncall",
            field=models.BooleanField(default=False),
        ),
    ]
