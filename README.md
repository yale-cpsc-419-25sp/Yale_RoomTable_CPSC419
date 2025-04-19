# RoomTable

Project Group 2

## Team Members
Brandon Nguyen, Angelica Pham, Kevin Guillen, Mandy Zhang, Briley Thomas

## Summary 
We want to create a CourseTable for Yale College housing where Yale students can
search for information (e.g. location, room configurations) about the different suites available in
each residential college. To streamline the housing process, the web application would also integrate
housing spreadsheets, where students can declare their group formations and suite preferences. For
now, we will be building our site to only display Murray rooms and suites.

## Setup and Installation

Ensure that you have [Node.js](https://nodejs.org/en/download) v20+ installed on your machine.

First, install all necessary packages using requirements.txt:

```
pip install -r requirements.txt
```

Next, set up two terminals (split terminal setup recommended). On one terminal, `cd` to the flask-server directory and run the command:

```
python runserver.py 8000
```
Note that port 8000 is necessary to use as of the beta version.

In the other terminal, `cd` to roomtable_client and run:
```
npm install
```

Afterwards, run:
```
npm run dev
```

Then, in a browser, navigate to `http://localhost:5173/`, the URL given in the terminal.

## Deliverables

### Final Version: May 1st, 2025
a. Improve on any known bugs

b. Strengthen stability of website

### Beta Version: April 18th, 2025
a. Add Bootstrap and other Javascript functionalities using libraries like React.js

b. Continue to improve on Presentation Tier to build a cohesive, aesthetically pleasing
front-end

c. Google Calendar integration for housing process timeline
### Alpha Version: April 9th, 2025
a. Enhance Presentation Tier by adding site logo, fonts, color, etc.

b. Attach floor plans to each suite/room on the Room Summary Page

c. Adding review and viewing reviews functionality to the Room Summary Page

### MVP: March 28th, 2025
a. Yale Central Authentication Service for user login

b. Presentation & Application Tiers
- Room Search Functionality
- Search for a room number or room characteristics, return from the
database
- Filter rooms based on configuration, number of people, etc. (Room Summary Page)
- Display information from the database about the room characteristics (Room Preference List)
- Ordered list of user’s favorite rooms/suites (Friends List)
- Users can add each other as friends and view each other’s Room
Preference List

c. Data Tier
- Users and Rooms Tables
- Other basic information about users and rooms relating them (room
preference, residential college, etc.)
- Relations between users and users (friends)
