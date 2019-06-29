# curse-bot
a bot to keep track of used curses and different levels of distastefulness milestones for discord servers

### Installation instructions
- **npm install:** run this command to install the libraries
- **create auth.json file:** create an auth.json file to hold the token information for the bot.
- **create curses.json file:** create a curses.json file to hold the different curses as well as user and server milestone messages. (refer to the cursesSchema.json file for exact layout)
- **node bot.js:** run this command to start up the bot

### File and Directory Information
- **DB/:** holds files related to the mongodb database that keeps track of server and user counts for cuss words
- **bot.js:** houses the main code for the bot that parses messages and sends messages to servers and users when milestones are hit
- **package.json:** holds project-wide information
- **cursesSchema.json** notes the schema of the curses.json file used by the server but is not present in this repo (for obvious vulgarity related reasons).
- **restart.sh:** A script that pulls the current master for the program and information files, verifies the integrity of curses.json and starts the server. This logic adheres to my file structure for the droplet that curse-bot is hosted on, use is not recommended unless file structure is similar.
