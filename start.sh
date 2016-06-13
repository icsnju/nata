#!/usr/bin/env bash
#cd minicap &&  nohup ./run.sh -P 1080x1920@360x640/0 >minicap.log 2>&1 &
#cd minicap &&  nohup ./run.sh  >minicap.log 2>&1 &
adb forward tcp:1717 localabstract:minicap
nohup sudo mongod &
# pm2 start ./bin/www
nodemon ./bin/www