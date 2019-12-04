FROM python:alpine

# to pack the foodmart metadata into bson:

# docker build -t metadata-pack .
# (assuming mondrian-rest is running on a network named piet)
# docker run -it --rm --network piet --mount type=bind,source=/tmp,target=/data metadata-pack python /code/pack-foodmart.py
# (this will create file /tmp/foodmart-metadata.bson)

# then to read it in nodejs:
# const BSON = require('bson');
# md = BSON.deserialize(fs.readFileSync('/tmp/foodmart-metadata.bson'))

RUN mkdir -p /code
RUN mkdir -p /data
RUN pip install requests bson
RUN apk add bash

COPY *.py /code/

WORKDIR /code