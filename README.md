# Rostr

#### Video Demo: https://youtu.be/G2NV0U9wkws?si=gLFQWPj6MTs4SmPK

#### Description:

Rostr is a web app for organizations to manage their members' daily work schedule. It enables managers/admin to create, edit, or delete shifts, and employees to view their and other staff's shifts. Members are automatically notified of changes in their schedule via email.

The project was created to address conflicts in work schedule, especially in healthcare. There are times when employees show up at work, only to find out that they are off because there has been some changes and they were just not informed. Rostr aims to minimize these problems by ensuring that staff are notified of every change in their shift. It also allows employees to view their schedule in real time, and eliminates the dependency for paper rosters.



#### Distinctiveness and Complexity:

This project is based on the project I submitted for CS50x with the same name, which utilized Flask, Jinja, and SQLite. For this version of the app, I overhauled my project to use the Django web framework instead, along with it's features such as models, model forms, Django templating, and it's database management system. Also, this time, web content is generated dynamically using Javascript. I also added some UI features such as modals and toasts.

The app is powered by:
-500+ lines of code in Javascript, containing 15 functions with multiple event listeners and element creators.
-200+ lines in Python views.py, including handlers for GET, POST, PATCH and DELETE requests.
-2 Django models with custom methods.
-Custom CSS styling.

Rostr's purpose, functionality and UI layout is different from the previous projects I made in CS50w. I also implemented functionalities that I didnt do before, such as manipulating modals and toasts in Javascript, creating and assigning a favicon, using Django's email functionality, and modifying/customizing models and form methods.



#### Files:
The file structure was automatically created using Django create app and create project.
Added/modified files:

capstone/settings.py: added settings for a custom User model and e-mail sending functionality.
capstone/urls.py: added Rostr.urls

Rostr/static/Rostr: favicon, logo,
    -Rostr.js: frontend script
    -styles.css: custom styling for the schedule table and buttons.

Rostr/templates/Rostr: html templates. All templates inherits from layout.html.

Rostr/admin.py: User and Shift models are registered.

Rostr/forms.py: defines the form for the Shift model. Modified the class constructor to make the start and end times required when the shift is not off, and vice versa. Also adds custom form validation and save behavior.

Rostr/models.py: defines the User and Shift models. Also defines serialize methods for JSON usage.

Rostr/urls.py: defines urls and their corresponding views.

Rostr/views.py: backend/server script. Includes handlers for getting, creating, editing, and deleting shifts. as well as sending emails.



#### Notes:
- Upon registration of a user, they would be non-admin by default. In order to give admin privileges(i.e. creating, editing, and deleting shifts) to a user, their profile in the database should be modified in Django admin by a superuser, an IT personnel for instance.
- Flatpickr was used for the date picker's functionality, and was imported through a CDN in
layout.html.
- The app uses the Gmail SMTP server to send emails, with a sending limit of 2000 messages per day.



#### How to run:
-The project is not yet deployed in a web hosting service, so currently it can be run in the VSCode terminal. In the app's root folder, run the command: python manage.py runserver


