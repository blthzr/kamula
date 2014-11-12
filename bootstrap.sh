#!/usr/bin/env bash

apt-get update
apt-get install -y software-properties-common python-software-properties
add-apt-repository -y ppa:chris-lea/node.js
apt-get update
apt-get install -y nodejs libxml2-dev git make mercurial upstart mongodb
git clone https://github.com/ajaxorg/cloud9.git /cloud9
( cd /cloud9 && mkdir logs && npm install )
cp /vagrant/cloud9.conf /etc/init/
start cloud9

