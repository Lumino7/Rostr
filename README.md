# Rostr

## Table of Contents
1. [Video Demo](#video-demo)
2. [How to Run](#how-to-run-locally)
3. [Deployment](#deployment)
4. [Description](#description)
5. [Features](#features)
6. [Technologies Used](#technologies-used)
7. [Files](#files)
8. [Notes](#notes)


#### Video Demo: https://youtu.be/G2NV0U9wkws?si=gLFQWPj6MTs4SmPK

#### How to run locally
1. Clone the repository.
2. Install dependencies:
   
   pip install -r requirements.txt
4. Set up the database:
   
   python manage.py migrate
6. Run the development server:
   
   python manage.py runserver

#### Deployment
-The project is hosted in Python Anywhere: https://lumino.pythonanywhere.com

#### Description

Rostr is a web app for organizations to manage their members' daily work schedule. It enables managers/admin to create, edit, or delete shifts, and employees to view their and other staff's shifts. Members are automatically notified of changes in their schedule via email.

The project was created to address conflicts in work schedule, especially in healthcare. There are times when employees show up at work, only to find out that they are off because there has been some changes and they were just not informed. Rostr aims to minimize these problems by ensuring that staff are notified of every change in their shift. It also allows employees to view their schedule in real time, and eliminates the dependency for paper rosters.

#### Features
- **Shift Management**:
  - Create, edit, delete shifts as an admin.
  - View shifts for all employees as a user.
- **Real-Time Notifications**:
  - Email notifications for shift updates.
- **User Management**:
  - Admin privileges configurable via Django admin.
- **Responsive Design**:
  - Mobile and desktop-friendly interfaces.


#### Technologies Used
- **Frontend**: Vanilla JavaScript, Bootstrap
- **Backend**: Django
- **Database**: Django ORM (default)
- **Styling**: Bootstrap, custom CSS
- **Email**: Gmail SMTP server


#### Files
The file structure was automatically created using Django create app and create project.
Added/modified files:

capstone/settings.py: added settings for a custom User model and e-mail sending functionality.
capstone/urls.py: added Rostr.urls

Rostr/static/Rostr: 
    -favicon and logo: assets for branding.
    -Rostr.js: frontend logic.
    -styles.css: custom styling for the schedule table and buttons.

Rostr/templates/Rostr: html templates. All templates inherits from layout.html.

Rostr/admin.py: User and Shift models are registered.

Rostr/forms.py: defines the form for the Shift model. Modified the class constructor to make the start and end times required when the shift is not off, and vice versa. Also adds custom form validation and save behavior.

Rostr/models.py: defines the User and Shift models. Also defines serialize methods for JSON usage.

Rostr/urls.py: defines urls and their corresponding views.

Rostr/views.py: backend/server logic. Includes handlers for getting, creating, editing, and deleting shifts. as well as sending emails.


#### Notes:
- Upon registration of a user, they would be non-admin by default. In order to give admin privileges(i.e. creating, editing, and deleting shifts) to a user, their profile in the database should be modified in Django admin by a superuser, an IT personnel for instance.
- Gmail SMTP has a sending limit of 2000 messages per day.






