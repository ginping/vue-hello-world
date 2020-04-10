import os
from glob import glob
from pathlib import Path, PurePath
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


def createUploadedList(fileHash):
    files = glob(f'{UPLOAD_DIR}/{fileHash}/*')
    return list(map(lambda x: x.rsplit('/')[-1], files))


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/ping')
def ping():
    return 'pong'


@app.route('/file/upload', methods=['POST'])
def file_upload():
    chunk = request.files.get('chunk')
    indexHash = request.form.get('hash')
    fileHash = request.form.get('fileHash')
    filename = request.form.get('filename')
    ext = PurePath(filename).suffix
    filePath = Path(f'{SAVE_DIR}/{fileHash}{ext}')
    if filePath.exists():
        return 'file exist'
    chunkDir = Path(f'{UPLOAD_DIR}/{fileHash}')
    if not chunkDir.is_dir():
        chunkDir.mkdir()
    chunk.save(f'{chunkDir}/{indexHash}')
    return {
        'code': 20000,
        'message': 'file upload success'
    }


@app.route('/merge', methods=['POST'])
def merge():
    filename = request.json.get('filename')
    fileHash = request.json.get('fileHash')
    ext = PurePath(filename).suffix
    outfile = Path(f'{SAVE_DIR}/{fileHash}{ext}')
    files = glob(f'{UPLOAD_DIR}/{fileHash}/*')
    files.sort()
    with open(outfile, 'wb') as outf:
        for file in files:
            with open(file, 'rb') as inf:
                outf.write(inf.read())
    return {
        'code': 20000,
        'message': 'file merge success'
    }


@app.route('/verify', methods=['POST'])
def file_md5_verify():
    fileHash = request.json.get('fileHash')
    filename = request.json.get('filename')
    ext = PurePath(filename).suffix
    filePath = Path(f'{SAVE_DIR}/{fileHash}{ext}')
    if filePath.exists():
        return {
            'shouldUpload': False
        }
    return {
        'shouldUpload': True,
        'uploadedList': createUploadedList(fileHash)
    }


if __name__ == '__main__':
    app.run(port=28080)

