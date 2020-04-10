import os
from glob import glob
from pathlib import Path
from flask import Flask, jsonify, Response, request

UPLOAD_DIR = 'target_chunk'
SAVE_DIR = 'target'


class MyResponse(Response):
    @classmethod
    def force_type(cls, response, environ=None):
        if isinstance(response, (list, dict)):
            response = jsonify(response)
        return super(Response, cls).force_type(response, environ)


app = Flask(__name__)
app.response_class = MyResponse


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/ping')
def ping():
    return 'pong'


@app.route('/file/upload', methods=['POST'])
def file_upload():
    chunk = request.files.get('chunk')
    file_hash = request.form.get('hash')
    filename = request.form.get('filename')
    chunkDir = Path(f'{UPLOAD_DIR}/{filename}')
    if not chunkDir.is_dir():
        chunkDir.mkdir()
    chunk.save(f'{chunkDir}/{file_hash}')
    return {
        'code': 20000,
        'message': 'file upload success'
    }


@app.route('/merge', methods=['POST'])
def merge():
    filename = request.json.get('filename')
    files = glob(f'{UPLOAD_DIR}/{filename}/*')
    files.sort()
    outfile = f'{SAVE_DIR}/{filename}'
    with open(outfile, 'wb') as outf:
        for file in files:
            with open(file, 'rb') as inf:
                outf.write(inf.read())
    return {
        'code': 20000,
        'message': 'file merge success'
    }


if __name__ == '__main__':
    app.run(debug=True, port=28080)

