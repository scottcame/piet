FROM tomcat:9.0-jdk8

COPY server.xml /usr/local/tomcat/conf/

RUN mkdir -p /opt/tomcat/shared/config/

COPY catalina.properties /usr/local/tomcat/conf/
COPY application.properties /usr/local/tomcat/shared/config/

RUN cd /tmp && \
  curl -o mondrian-rest.war https://repo1.maven.org/maven2/org/ojbc/mondrian-rest/2.0.1/mondrian-rest-2.0.1.war && \
  mv mondrian-rest.war /usr/local/tomcat/webapps/

COPY *.war /usr/local/tomcat/webapps/
