#!/bin/bash
#First script

#does git pulls in the major folders and then moves the curses.json
#file into the curse-bot directory for the server to use
pullFilesFromRepository() {
  git pull
  echo "updating curses.json file"
  rm curses.json
  cd ../curse-files
  git pull
  cp -r curses.json ../curse-bot/curses.json 
  cd ../curse-bot
}

#This function will go through and check that all the necessary
#Objects and arrays are inside of the curses.json file.
#returns true if all are found, otherwise it returns a list of all 
#missing objects/arrays missing
verifyCurseFileIntegrity() {
  retval="true"
  errString=""
  CURSES=($(jq .curses curses.json))
  if [ "$CURSES" == "null" ]
  then
    retval="false"
    errString='ERROR: missing "curses" array in curses.json file'
  fi
  HELP=($(jq .helpMessage curses.json))
  if [ "$HELP" == "null" ]
  then
    retval="false"
    errString+=$'\nERROR: missing "helpMessage" object in curses.json'
  fi
  CFREE=($(jq .curseFreeMessage curses.json))
  if [ "$CFREE" == "null" ]
  then
    retval="false"
    errString=$'\nERROR: missing "curseFreeMessage" object in curses.json file'
  fi
  SMM=($(jq .SwearWordMissingMessage curses.json))
  if [ "$SMM" == "null" ]
  then
    retval="false"
    errString+=$'\nERROR: missing "SwearWordMissingMessage" object in curses.json file'
  fi
  SB=($(jq .sealBreakerMessage curses.json))
  if [ "$SB" == "null" ]
  then
    retval="false"
    errString+=$'\nERROR: missing "sealBreakerMessage" object in curses.json file'
  fi
  UM=($(jq .userMessages curses.json))
  if [ "$UM" == "null" ]
  then
    retval="false"
    errString+=$'\nERROR: missing "userMessages" array in curses.json file'
  fi
  SM=($(jq .serverMessages curses.json))
  if [ "$SM" == "null" ]
  then
    retval="false"
    errString+=$'\nERROR: missing "serverMessages" array in curses.json file'
  fi
  BR=($(jq .botResponses curses.json))
  if [ "$BR" == "null" ]
  then
    retval="false"
    errString+=$'\nERROR: missing "botResponses" array in curses.json file'
  fi
  #our pseudo return value comparison
  if [ "$retval" == "false" ]
  then
    echo "$errString"
  else 
    echo "$retval"
  fi
  
}

#main driver
echo "checking repository for updated code"
pullFilesFromRepository
echo "verifying integrity of curses.json file"
VAR=$(verifyCurseFileIntegrity) 
if [ "$VAR" != "true" ]
then
  echo "$VAR"
  echo "exiting with errors"
else
  echo "curses.json file integrity verified"
  echo "starting server"
  node bot.js
fi
