# 2019-Battlecode-Bot
This repo contains our team's bot entry into the 2019 battlecode competition.

## Structure
The bots live in the bots directory. Our bot will be in bots/mainbot/
All other directories in bots/ will be used to create testing bots to play against.

The files are separated out by robot type. For example, castles, crusaders and pilgrims will all have their own files.
The logic for what a crusader should do on its turn will be in the crusader.js file.
The robot.js file will exist to determine which type of robot is taking a turn and pass control to that file.

## Testing
To run the builtin tests and code coverage reports for this project, use the
`npm test` command. This will compile the bot, run the tests with mocha, and
calculate the coverage report with nyc.
