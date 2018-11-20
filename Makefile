
all: fmt test

test:
	deno ./test.ts

test-ci:
	docker run maxmcd/deno:slim deno --version
	docker run -v $(CURDIR):/dotenv -w /dotenv maxmcd/deno:slim sh -c "DENO_DIR=.deno deno ./test.ts"

fmt:
	docker run -i --rm -v $(CURDIR):/work tmknom/prettier --parser=typescript --write '**/*.ts'
