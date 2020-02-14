
DENO_INSTALL=./.deno_bin
DENO_BIN=${DENO_INSTALL}/bin/deno

all: fmt test

install:
	rm -vrf ${DENO_INSTALL}
	curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=${DENO_INSTALL} sh
	${DENO_BIN} --version

test:
	${DENO_BIN} run --reload --allow-env --allow-read ./test.ts

fmt:
	${DENO_BIN} fmt *

.PHONY: test fmt install
