SERVER := root@dobby.fund
FOLDER := /opt/dobby-fund-static

default: build-static upload-static upload-nginx restart-nginx

build-static:
	(cd app && npm run generate)

upload-static:
	rsync -av ./app/.output/public/ '$(SERVER):$(FOLDER)' --delete

upload-nginx:
	rsync -av ./nginx-static.conf '$(SERVER):/etc/nginx/sites-enabled/dobby-fund-static.conf'

restart-nginx:
	ssh $(SERVER) 'service nginx restart'
