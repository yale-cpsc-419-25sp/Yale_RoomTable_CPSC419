from time import localtime, asctime, strftime
from flask import Flask, request, make_response, redirect, url_for
from flask import render_template

app = Flask(__name__, template_folder='.')


@app.route('/', methods=['GET'])
def index():

    html = render_template('index.html')
    response = make_response(html)
    return response
