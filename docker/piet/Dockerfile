FROM tomcat:9.0-jdk8

COPY *.war /usr/local/tomcat/webapps/
COPY server.xml /usr/local/tomcat/conf/

RUN mv /usr/local/tomcat/webapps/piet*.war /usr/local/tomcat/webapps/piet.war

RUN cd /tmp && \
  curl -O http://central.maven.org/maven2/org/ojbc/mondrian-rest/1.4.2/mondrian-rest-1.4.2.war && \
  mv mondrian-rest-1.4.2.war /usr/local/tomcat/webapps/mondrian-rest.war

