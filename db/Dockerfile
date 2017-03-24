FROM mysql:8
COPY accrevocompany.sql /docker-entrypoint-initdb.d/
RUN chmod 444 /docker-entrypoint-initdb.d/accrevocompany.sql
ENV MYSQL_DATABASE accrevocompany