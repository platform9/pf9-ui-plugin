#! vim noexpandtab
# Copyright 2018 Platform 9 Systems, Inc.
#

TOP_DIR := $(abspath ..)
SRC_DIR := $(TOP_DIR)/build/ui
SUPPORT_DIR := $(TOP_DIR)/support
BUILD_DIR := $(TOP_DIR)/build/rpmbuild

ENV_TYPE ?= production
PF9_VERSION ?= 3.9.0
BUILD_NUMBER ?= 0
UI_PLUGIN_RPM := $(BUILD_DIR)/ui-plugin-$(VERSION).rpm
RPM_DIR := $(BUILD_DIR)
SPEC_FILE := $(BUILD_DIR)/rpm.spec

NODEJS_DIR := $(TOP_DIR)/node
NODEJS_DOWNLOAD_SCRIPT = $(shell pwd)/download-nodejs-latest-v10.x.sh
NODE_BIN := $(NODEJS_DIR)/bin/node
NPM_BIN := $(NODE_BIN) $(NODEJS_DIR)/bin/npm --scripts-prepend-node-path=true

YARN_DIR := $(TOP_DIR)/yarn
YARN_BIN := $(YARN_DIR)/bin/yarn

SHELL := /bin/bash

# example usage: $(call download_nodejs,"linux","/path/to/node")
define download_nodejs
tar xz --strip-components=1 -C $2 --file $(shell ${NODEJS_DOWNLOAD_SCRIPT} $1 $(TOP_DIR))
endef

${BUILD_DIR}:
	mkdir -p $@

${SPEC_FILE}: ${BUILD_DIR}
	hash=`git rev-parse --short HEAD`; \
	sed -e "s/__BUILDNUM__/${BUILD_NUMBER}/" -e "s/__GITHASH__/$${hash}/" -e "s/__VERSION__/${PF9_VERSION}/" $(SUPPORT_DIR)/ui-plugin-rpm.spec > ${SPEC_FILE}

${UI_PLUGIN_RPM}: ${SPEC_FILE}
	echo "RPM build goes here"
	echo "SRC_DIR: $(SRC_DIR)"
	echo "BUILD_DIR: $(BUILD_DIR)"
	echo "RPM_DIR: $(RPM_DIR)"
	echo "SPEC_FILE: $(SPEC_FILE)"
	rpmbuild -bb --define "_topdir $(RPM_DIR)" --define "_src_dir $(SRC_DIR)" ${SPEC_FILE}

$(NODEJS_DIR):
	mkdir -p $@
	$(call download_nodejs,"linux",$@)

$(YARN_DIR):
	mkdir -p $@	
	wget -O $@/latest.tar.gz https://yarnpkg.com/latest.tar.gz
	tar xf $@/latest.tar.gz -C $@ --strip-components=1 

dependencies: $(NODEJS_DIR)
	pushd $(TOP_DIR) && \
	PATH=$(NODEJS_DIR)/bin:$$PATH $(YARN_BIN) && \
	popd

yarn: $(YARN_DIR)

yarn-clean:
	rm -rf $(YARN_DIR)

build: $(NODEJS_DIR) $(YARN_DIR) | dependencies
	echo "NODE VERSION: "
	$(NODE_BIN) --version
	echo "NPM VERSION: "
	$(NPM_BIN) --version
	echo "building (npm run build)..."
	NODE_ENV=$(ENV_TYPE) PATH=$(NODEJS_DIR)/bin:$$PATH $(YARN_BIN) build 

rpm: build ${UI_PLUGIN_RPM}

clean:
	rm -rf $(BUILD_DIR)
