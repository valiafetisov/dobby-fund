SERVER := root@dobby.fund
FOLDER := ~/dobby

default: upload server-start server-logs

upload:
	rsync -av . '$(SERVER):$(FOLDER)' --exclude='.git' --exclude='node_modules' --exclude='.output' --exclude='.nuxt' --delete

server-start:
	ssh $(SERVER) 'cd $(FOLDER) && docker compose up --build --force-recreate -d'

server-logs:
	ssh $(SERVER) 'cd $(FOLDER) && docker compose logs -f'
