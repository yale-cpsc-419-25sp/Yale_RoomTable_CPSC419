# RoomTable

## Project Group 2
Brandon Nguyen, Angelica Pham, Kevin Guillen, Mandy Zhang, Briley Thomas

## Summary 
We want to create a CourseTable for Yale College housing where Yale students can
search for information (e.g. location, room configurations) about the different suites available in
each residential college. To streamline the housing process, the web application would also integrate
housing spreadsheets, where students can declare their group formations and suite preferences. For
now, we will be building our site to only display Murray rooms and suites.

## Setup and Installation

Ensure that you have [Node.js](https://nodejs.org/en/download) v20+ installed on your machine.

First, create a virtual environment and install all necessary packages using requirements.txt:

```
python3 -m venv [NAME OF YOUR VENV]
source [NAME OF YOUR VENV]/bin/activate
pip3 install -r requirements.txt
```

Next, `cd` to client and run:
```
npm install
```

Afterwards, run:
```
npm run dev
```

Then, in a browser, navigate to
```
http://localhost:5173/
```

## Project Structure
```
root/
├── api/
│   ├── data/
│   ├── models/
│   ├── database.py
│   ├── roomtable.py
│   └── runserver.py
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       └── pages/
│
└── 
```

The most interesting and technically impressive features we implemented were the Yale CAS Login, friend request functionality (including being able to see the suites that your friend has saved and utilizing the Yalies API to validate friend search), and overall UI/UX. The Yale CAS Login functionality can be found in `root/api/roomtable.py` in the first ~50 lines of the file. The friend request backend functionality can be found in `root/api/roomtable.py` in the `add_friend()`, `get_friends()`, `get_requests()`, and `search_friends()` functions, and the frontend functionality can be found in `root/client/src/pages/Friends.tsx`.
