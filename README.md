# pearl

I used React, Express, MongoDB to take a coding assessment to a whole 'nother level. The assignment basically asked me to take 400,000 rows of data, make it look good. 

My goal was to get away from a spreadsheet representation and go with something that felt more like a social media feed. Fundings are served in a infinite scroll with basic details displayed in a readable format. Clicking on a fund exposes payment details in a line chart, with a toggle to switch to a table view. Clicking any funding detail links will filter the feed to all funds that match that field's value.

To make it all work, I converted the txt files to csv and imported to a Mongo database at Monoglab.com. The server-side was built on Express and uses Facebook for authentication. I used Mongoose to assist with queries and pagination. I used Google Charts for the line graph, and while it got the job done quickly, it was very limiting in terms of design. I used Facebook's Fixed Data Table, for the scrollable payment spreadsheet.