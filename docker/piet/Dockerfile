FROM tomcat:9.0-jdk8

COPY *.war /usr/local/tomcat/webapps/

RUN mv /usr/local/tomcat/webapps/piet*.war /usr/local/tomcat/webapps/piet.war

# uncomment once mondrian-rest settles down...

# RUN cd /tmp && \
#   curl -O http://central.maven.org/maven2/org/ojbc/mondrian-rest/1.3.4/mondrian-rest-1.3.4.war && \
#   mv mondrian-rest-1.3.4.war /usr/local/tomcat/webapps/mondrian-rest.war

