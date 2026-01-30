server {
    # Настройки по умолчанию
    listen 80;
    server_name food-63.ru;
    root /var/www/vkr/local-food-board-front/dist/local-food-board-front/browser;
    index index.html;

    location / {
        # Check if the requested file ($uri) or directory ($uri/) exists.
        # If not, fallback to index.html to let Angular handle the route.
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000/api;
        proxy_set_header Host $host;
    }
    location /marker-icon.png {
        alias /home/pavel/actions-runner/_work/vkr/vkr/local-food-board-front/dist/local-food-board-front/browser/media/marker-icon.png;
    }
    location /marker-shadow.png {
        alias /home/pavel/actions-runner/_work/vkr/vkr/local-food-board-front/dist/local-food-board-front/browser/media/marker-shadow.png;
    }

    # Перехватим статические файлы, отключим логи, увеличим время expire, отключим лог доступа и ошибок для favicon.ico и robots.txt
    location ~* ^.+.(js|css|jpg|jpeg|gif|ico|woff)$ {
    access_log off;
    expires max;
    }

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
