# download the foodmart metadata from mondrian-rest running locally (on same network as this image) and message-pack it

import requests
import bson

r = requests.get(url="http://mondrian-rest/mondrian-rest/getMetadata?connectionName=foodmart")
r = r.json()

with open('/data/foodmart-metadata.bson', 'wb') as outfile:
    outfile.write(bson.dumps(r))