
# stop db.food-63.ru
cd /var/www/vkr/local-food-board-db-tool
pm2 stop index-db
#npm i
#cp -r node_modules ~/cache/db-tools/
ln -s ~/cache/db-tools/node_modules/ ./node_modules


# stop food-63.ru/api
pm2 stop server
cd /var/www/vkr/local-food-board-backend
#npm i
#cp -r node_modules ~/cache/back/
ln -s ~/cache/back/node_modules/ ./node_modules
npm run build

cd /var/www/vkr/local-food-board-backend/dist/
cp ~/database-last-backup.sqlite /var/www/vkr/local-food-board-backend/dist/database.sqlite
cp -r ~/uploads-backup /var/www/vkr/local-food-board-backend/dist/uploads

pm2 start server

# start food-63.ru/api
cd /var/www/vkr/local-food-board-backend
npm run create-admin

# start db.food-63.ru
cd /var/www/vkr/local-food-board-db-tool
pm2 start index-db

#curl http://food-63.ru/api/health

# build front food-63.ru
cd /var/www/vkr/local-food-board-front
#npm i
#cp -r node_modules ~/cache/front/
ln -s ~/cache/front/node_modules/ ./node_modules
npm run build




