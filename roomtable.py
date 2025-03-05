from time import localtime, asctime, strftime
from flask import Flask, request, make_response, redirect, url_for
from flask import render_template

app = Flask(__name__, template_folder='./templates')


@app.route('/', methods=['GET'])
def index():

    html = render_template('index.html')
    response = make_response(html)
    return response

@app.route('/search', methods=['GET'])
def search():
    html = render_template('search.html')
    response = make_response(html)
    return response

@app.route('/results', methods=['GET'])
def results():
    capacity = request.args.get('capacity')
    print(capacity)
    floor = request.args.get('floor')
    class_year = request.args.get('class')
    html = render_template('results.html', capacity=capacity, floor=floor, class_year=class_year)
    response = make_response(html)
    return response
