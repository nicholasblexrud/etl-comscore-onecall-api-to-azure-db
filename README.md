# ETL Process
* Extract from ComScore OneCall API
* Transform data from CSV to SQL table, run stored procedure
* Load Data into Azure SQL database

The script can be configured by adding your ComScore user information, Azure SQL db info and credentials to `libs/config.js`. You also can specify SQL tableName and stored procedure associated with transformation to `index.js`. You'll need to have your ComScore account enabled (within the tool itself or through support) to get data out of it; there is a cost associated with each call. 

Run script by doing: `npm start`.

## Things that I need help on/todo:
* **Unit tests**: I'm not sure where to begin in order to start this - probably requires rewriting a lot of code. I took a stab at attempting to write my own tests, but I feel like my code isn't in a state to be tested.
* **To make the more modular/reusable**: I need to decouple code. This was made for a specific purpose; hence why it's tightly-coupled. I *believe* it has a wider use to others; if it doesn't, it's still a good learning process.
* **Use of promises**: I *think* they way I'm using it is an example of an anti-pattern. 
* **Error/Exceptional Handling**: I'm not sure I'm handling this correctly. *Currently running this on Ubuntu VM and script is running as a cronjob*.


Additional info:

* [ComScore OneCall API Documentation](http://dax-files.comscore.com/digitalanalytix/EU/onecall_api/help.html) (it's not the greatest)
