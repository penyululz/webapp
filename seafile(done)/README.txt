mkdir /opt/seafile
cd /opt/seafile


# Seafile CE 11.0
wget -O "docker-compose.yml" "https://manual.seafile.com/docker/docker-compose/ce/11.0/docker-compose.yml"

nano docker-compose.yml

# if `docker-compose.yml` file is in current directory:
docker-compose up -d

eafile directory structure
/opt/seafile-data

find logs
To monitor container logs (from outside of the container), please use the following commands:

# if the `docker-compose.yml` file is in current directory:
docker compose logs --follow
# if the `docker-compose.yml` file is elsewhere:
docker compose -f /path/to/docker-compose.yml logs --follow

# you can also specify container name:
docker compose logs seafile --follow
# or, if the `docker-compose.yml` file is elsewhere:
docker compose -f /path/to/docker-compose.yml logs seafile --follow