.PHONY: build-database
build-database:
	@echo "Building database..."
	docker-compose -f docker/viater/docker-compose-db.yml up --build --remove-orphans

.PHONY: start-database
start-database:
	@echo "Starting database..."
	docker-compose -f docker/viater/docker-compose-db.yml up -d