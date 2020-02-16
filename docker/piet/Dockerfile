# Copyright 2020 National Police Foundation
# Copyright 2020 Scott Came Consulting LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM tomcat:9.0-jdk8

COPY server.xml /usr/local/tomcat/conf/

RUN mkdir -p /opt/tomcat/shared/config/

COPY catalina.properties /usr/local/tomcat/conf/
COPY application.properties /usr/local/tomcat/shared/config/

RUN cd /tmp && \
  curl -o mondrian-rest.war https://repo1.maven.org/maven2/org/ojbc/mondrian-rest/2.0.2/mondrian-rest-2.0.3.war && \
  mv mondrian-rest.war /usr/local/tomcat/webapps/

COPY *.war /usr/local/tomcat/webapps/
