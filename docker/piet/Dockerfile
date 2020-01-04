FROM tomcat:9.0-jdk8

COPY server.xml /usr/local/tomcat/conf/

RUN mkdir -p /opt/tomcat/shared/config/

COPY catalina.properties /usr/local/tomcat/conf/
COPY application.properties /usr/local/tomcat/shared/config/

RUN cd /tmp && \
  curl -O http://central.maven.org/maven2/org/ojbc/mondrian-rest/1.4.2/mondrian-rest-1.4.2.war && \
  mv mondrian-rest-1.4.2.war /usr/local/tomcat/webapps/mondrian-rest.war

COPY *.war /usr/local/tomcat/webapps/
