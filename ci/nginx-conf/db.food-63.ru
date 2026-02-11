server {
    # Настройки по умолчанию
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/food-63.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/food-63.ru/privkey.pem;

    # Рекомендуемые настройки безопасности
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    server_name db.food-63.ru;

    # Проксирование api bd SQLite GUI
    location = / {
        return 301 /home;
    }
    location / {
        auth_basic "Administrator’s Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://localhost:3005;
        proxy_set_header Host $host;
    }
    # Перехватим статические файлы, отключим логи, увеличим время expire, отключим лог доступа и ошибок для favicon.ico и robots.txt

    location = /favicon.ico {
    log_not_found off;
    access_log off;
    }

    location = /robots.txt {
    allow all;
    log_not_found off;
    access_log off;
    }
}
