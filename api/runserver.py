"""
Runs the server

Usage:
    python3 runserver.py [PORT]
"""

from sys import argv, exit, stderr
from os import environ
from roomtable import app


def main():
    """Main function to start Flask API."""
    if len(argv) != 2:
        print('Usage: ' + argv[0] + ' port', file=stderr)
        exit(1)

    try:
        port = int(argv[1])
        environ['PORT'] = str(port)
    except Exception:
        print('Port must be an integer.', file=stderr)
        exit(1)
    try:
        app.run(host='0.0.0.0', port=port, debug=True)
    except Exception as ex:
        print(ex, file=stderr)
        exit(1)

if __name__ == '__main__':
    main()
