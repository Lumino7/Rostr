from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("me", views.me, name="me"),
    path("shifts", views.shifts, name="shifts"),
    path("shifts/<int:id>", views.shift, name="shift")
]
