FROM php:8.3-apache

RUN docker-php-ext-install pdo_mysql mysqli

# PHP's recommended production settings (errors go to the log, not into responses),
# plus overrides for what the template leaves at unsafe or too-small defaults
RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
 && printf '%s\n' \
    'expose_php = Off' \
    'session.use_strict_mode = 1' \
    'session.cookie_httponly = 1' \
    'upload_max_filesize = 6M' \
    > "$PHP_INI_DIR/conf.d/app.ini"

# Behind the host's Nginx every request comes from the Docker network; take the visitor's real IP
# from X-Real-IP, but only when the request comes from that private range (the port is bound to
# 127.0.0.1, so nothing outside the server can reach Apache directly and fake the header)
RUN a2enmod remoteip \
 && printf '%s\n' \
    'RemoteIPHeader X-Real-IP' \
    'RemoteIPInternalProxy 172.16.0.0/12' \
    > /etc/apache2/conf-available/remoteip.conf \
 && a2enconf remoteip

COPY src/ /var/www/html/

# Apache runs as www-data and must be able to write uploaded images; the uploads-data volume
# in docker-compose.yml is mounted here and takes this ownership when it is first created
RUN mkdir -p /var/www/html/uploads/projects \
 && chown -R www-data:www-data /var/www/html/uploads

EXPOSE 80
