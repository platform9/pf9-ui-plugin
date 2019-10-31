# Copyright (C) 2019 Platform 9 Systems, Inc.

.SUFFIXES:
.PHONY: clean push image stage

SRCROOT = $(abspath $(dir $(CURDIR)/../$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))))
CONTAINER_ROOT=$(SRCROOT)/decco-container
BUILD_DIR = $(SRCROOT)/build
CONTAINER_BUILD_DIR = $(SRCROOT)/build-container
STAGE = $(CONTAINER_BUILD_DIR)/stage
CONTAINER_TAG = $(CONTAINER_BUILD_DIR)/container-tag
EXTRACTED_RPM_DIR = $(CONTAINER_BUILD_DIR)/rpm
PUBLIC_FILES =  $(STAGE)/publicfiles
METADATA_FILE =  $(STAGE)/app_metadata.json
UI_DIR =  $(PUBLIC_FILES)/ui
PF9_VERSION ?= 1.0.0
BUILD_NUMBER ?= 0
BUILD_ID := $(BUILD_NUMBER)
IMAGE_REPO ?= 514845858982.dkr.ecr.us-west-1.amazonaws.com/pf9-serenity
IMAGE_TAG ?= $(or $(PF9_VERSION), $(PF9_VERSION), "latest")-$(BUILD_ID)
BRANCH_NAME ?= $(or $(TEAMCITY_BUILD_BRANCH), $(TEAMCITY_BUILD_BRANCH), $(shell git symbolic-ref --short HEAD))
RPM ?= $(shell find $(BUILD_DIR)/rpmbuild -name 'pf9-ui-plugin-*.rpm')
CONSUL_URL ?= https://releases.hashicorp.com/consul/1.0.6/consul_1.0.6_linux_amd64.zip
CONFD_URL ?= https://github.com/kelseyhightower/confd/releases/download/v0.15.0/confd-0.15.0-linux-amd64

$(shell mkdir -p $(STAGE))
$(shell mkdir -p $(PUBLIC_FILES))

$(EXTRACTED_RPM_DIR): $(RPM)
	mkdir -p $@
	cd $@ && rpm2cpio $(RPM) | cpio -idmv

# Enable this rule (and comment out the one below) to use
# single optimized & minified JS file
$(UI_DIR): $(EXTRACTED_RPM_DIR)
	mv $(EXTRACTED_RPM_DIR)/opt/pf9/www/public/ui $(PUBLIC_FILES)

# Enable this rule (and comment out the one above) to use
# unoptimized development build (separate JS files)
#$(UI_DIR): $(BUILD_DIR)
#	mkdir -p $@
#	cp -a $(BUILD_DIR)/* $@/

$(METADATA_FILE): $(UI_DIR)
	echo "Downloading consul"
	cd $(STAGE) && wget -q $(CONSUL_URL) && unzip consul_*.zip
	cd $(STAGE) && wget -q -O confd $(CONFD_URL) && chmod +x confd
	cp -f $(CONTAINER_ROOT)/Dockerfile $(STAGE)
	cp -r $(CONTAINER_ROOT)/conf $(STAGE)
	cp -f $(CONTAINER_ROOT)/{init-region,start.sh} $(STAGE)
	python $(CONTAINER_ROOT)/y2j.py $(CONTAINER_ROOT)/app_metadata.yaml > $@

stage: $(METADATA_FILE)

$(CONTAINER_TAG):
	echo -ne "$(IMAGE_TAG)" >$@

image: stage $(CONTAINER_TAG)
	echo "Building Image"
	docker build --rm -t $(IMAGE_REPO):$(IMAGE_TAG) \
		--build-arg BUILD_ID=$(BUILD_ID) \
		--build-arg VERSION=$(PF9_VERSION) \
		--build-arg BRANCH="$(BRANCH_NAME)" \
		--build-arg APP_METADATA=`cat $(METADATA_FILE)` \
		$(STAGE)
	echo -ne "$(IMAGE_TAG)" >$(CONTAINER_BUILD_DIR)/container-tag

# This assumes that credentials for the aws tool are configured, either in
# ~/.aws/config or in AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
push: image
	docker push $(IMAGE_REPO):$(IMAGE_TAG) || \
	(aws ecr get-login --region=us-west-1 --no-include-email |sh && \
	 docker push $(IMAGE_REPO):$(IMAGE_TAG))

clean:
	rm -rf $(CONTAINER_BUILD_DIR)
