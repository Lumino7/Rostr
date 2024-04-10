import json

from django.contrib.auth import authenticate, login, logout, get_user
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from django.shortcuts import HttpResponseRedirect, render, get_object_or_404
from django.urls import reverse
from datetime import datetime, timedelta
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings

from .models import User, Shift
from .forms import ShiftForm

def index(request):
    user = request.user
    if request.method == "POST":
        return
    else:
        if user.is_authenticated:
            form = ShiftForm()
            return render(
                request, "Rostr/index.html", {"form": form}
            )
        else:
            return render(
                request, "Rostr/login.html"
            )

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request,
                "Rostr/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "Rostr/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


@csrf_exempt
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        last_name = request.POST["last_name"]
        first_name = request.POST["first_name"]


        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(
                request, "network/register.html", {
                    "message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.last_name = last_name
            user.first_name = first_name
            user.save()
        except IntegrityError:
            return render(
                request, "network/register.html", {
                    "message": "Username already taken."}
            )
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "Rostr/register.html")

@login_required
def me(request):
    user = request.user

    if request.method == "GET":
        return JsonResponse(user.serialize())

    return JsonResponse({}, status=400)

@login_required
@csrf_exempt
def shifts(request):
    current_user = get_user(request)

    if request.method == 'POST':
        if not current_user.is_admin:
            return JsonResponse({}, status=403)

        data = json.loads(request.body)

        try:
            user = User.objects.get(pk=data['user-id'])
        except User.DoesNotExist:
            return JsonResponse({'errors': ['User does not exist']}, status=400)

        date = datetime.fromisoformat(data['date'])

        # Check if the Shift object already exists
        if Shift.objects.filter(user=user, date=date).exists():
            return JsonResponse({'errors': ['User already has a shift on this date']}, status=409)

        form = ShiftForm(data)

        if form.is_valid():
            instance = form.save(user=user, date=date)
            return JsonResponse(instance.serialize())
        else:
            return JsonResponse({'errors': form.errors}, status=400)

    if request.method == "GET":
        start_date_str = request.GET.get('start_date')

        if not start_date_str:
            return HttpResponseBadRequest("'start_date' parameter is missing/invalid")

        start_date = datetime.fromisoformat(start_date_str)
        end_date = start_date + timedelta(days=6)

        users = User.objects.filter(is_staff=False).order_by("last_name") #is_staff is an attribute of the User model that gives the user access to /admin. i.e. superusers.

        try:
            shifts = Shift.objects.filter(date__range=(start_date, end_date))
            response_data = []
            for user in users:
                user_shifts = shifts.filter(user__username=user.username)
                user_shifts = user_shifts.order_by("date")
                item = {
                    "user": user.serialize(),
                    "shifts": []
                }
                for i in range(7):
                    shift_date = start_date + timedelta(days=i)
                    shift_date = shift_date.date()
                    individual_shift = user_shifts.filter(
                        date=shift_date).first()
                    if individual_shift is not None:
                        item["shifts"].append(individual_shift.serialize())
                    else:
                        item["shifts"].append(None)

                response_data.append(item)

            return JsonResponse(response_data, safe=False)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

@login_required
@csrf_exempt
def shift(request, id):
    current_user = get_user(request)

    shift_instance = get_object_or_404(Shift, id=id)

    if request.method == 'PATCH':
        if not current_user.is_admin:
            return JsonResponse({}, status=403)

        data = json.loads(request.body)

        form = ShiftForm(data, instance= shift_instance) #selects a particular instance and edits that instead of making a new one.
        if form.is_valid():
            instance = form.save()
            try:
                send_email(shift_instance.user.first_name, shift_instance.date, [shift_instance.user.email])
            except Exception as e:
                print(e)
            return JsonResponse(instance.serialize())
        else:
            return JsonResponse({'errors': form.errors}, status=400)

    if request.method == 'DELETE':
        if not current_user.is_admin:
            return JsonResponse({}, status=403)

        shift_instance.delete()

        return JsonResponse({}, status=200)


    return JsonResponse({}, status=400)

def send_email(first_name, date, recipients):
    subject = 'Rostr: Changes to your roster'
    message = "Hi {}. There has been changes in your roster for {}. Kindly check the Rostr website. Thank you.".format(first_name, date.strftime("%d %b %Y"))
    from_email = settings.EMAIL_HOST_USER
    to_email = recipients
    try:
        send_mail(subject, message, from_email, to_email)
    except:
        print('send_mail didnt work')
