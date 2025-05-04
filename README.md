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

Set up an API key to use for the "Search Friends" functionality by navigating to this [Yalies.io link](https://yalies.io/api). Enter the key description and create a ```.env``` file with one line formatted as follows:
```
YALIES_API_KEY=<api key here>
```

Please let us know if retrieval of the API key doesn't work since we aren't 100% sure if Yale faculty have access to that page. The ```.env``` file should be placed in the root directory of our project.

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

We utilize a system in which the ```api``` folder acts as a server that provides database information and performs some computation in the application tier to the ```client``` folder. ```data``` contains our database, ```models``` contains SQLAlchemy files for setting up our schema, ```roomtable.py``` acts as the main component of the server for retrieving database information, modifying it, and sending it to the front-end, and ```runserver.py``` gets the server running.

In the ```client``` folder, the ```public``` folder acts as storage for some images we use, notably for floorplans and our logo. ```src``` contains most of the source code for the Typescript/React components with ```components``` being some of our more involved features like the landing page and drop-down menu and ```pages``` containing the details for how each page is rendered.

The most interesting and technically impressive features we implemented were the Yale CAS Login, friend request functionality (including being able to see the suites that your friend has saved and utilizing the Yalies API to validate friend search), and overall UI/UX. The Yale CAS Login functionality can be found in `root/api/roomtable.py` in the first ~50 lines of the file. The friend request backend functionality can be found in `root/api/roomtable.py` in the `add_friend()`, `get_friends()`, `get_requests()`, and `search_friends()` functions, and the frontend functionality can be found in `root/client/src/pages/Friends.tsx`.
