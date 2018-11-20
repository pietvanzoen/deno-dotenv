
all: fmt test

test:
	deno ./test.ts

fmt:
	docker run -i --rm -v $(CURDIR):/work tmknom/prettier --parser=typescript --write '**/*.ts'
