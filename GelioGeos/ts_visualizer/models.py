from django.db import models


class MagneticFieldData(models.Model):
    date = models.DateField()
    station = models.CharField(max_length=3)
    x = models.FloatField(null=True)
    y = models.FloatField(null=True)
    z = models.FloatField(null=True)
