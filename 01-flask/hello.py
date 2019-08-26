# Hello World using Flask. From Quickstart
# https://flask.palletsprojects.com/en/1.1.x/quickstart/
# To run. Name this source code file as hello.py and then:
#   $ export FLASK_APP=hello.py
#   $ flask run
# Now head over to http://127.0.0.1:5000/, and you 
# should see your hello world greeting.

# make sure to have flask installed
#   $ conda install flask

#####

# import Flask library to use in this code
from flask import Flask

# Create and name a class instance
# https://flask.palletsprojects.com/en/1.1.x/quickstart/
    # "The first argument is the name of the application’s module or package. If you
    # are using a single module (as in this example), you should use __name__
    # because depending on if it’s started as application or imported as module the
    # name will be different ('__main__' versus the actual import name). This is
    # needed so that Flask knows where to look for templates, static files, and so
    # on."
app = Flask(__name__)

# route tells what URL triggers the following 'def' (function)
@app.route('/')
def index():
    return 'Index Page'

@app.route('/hello')
def hello_world():
    return 'Hello, World!'

#@app.route('/user/<username>')
#def show_user_profile(username):
#    # show the user profile for that user
#    return 'User %s' % escape(username)

@app.route('/post/<int:post_id>')
def show_post(post_id):
    # show the post with the given id, the id is an integer
    return 'Post %d' % post_id

@app.route('/path/<path:subpath>')
def show_subpath(subpath):
    # show the subpath after /path/
    return 'Subpath %s' % escape(subpath)
