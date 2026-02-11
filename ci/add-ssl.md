sudo apt update
sudo apt install certbot python3-certbot-nginx

sudo certbot --nginx -d food-63.ru -d www.food-63.ru

Ключи 
/etc/letsencrypt/live/food-63.ru/fullchain.pem
/etc/letsencrypt/live/food-63.ru/privkey.pem


sudo chmod 777 /etc/letsencrypt/live/food-63.ru


