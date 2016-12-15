# tellmeupwork

**Usage**

Allows to monitor a set of job searches every 30 mns and send an email including all new jobs found.
Perform a upwork job search and select "Add url to watchlist" using right-click. Monitoring is started as soon as the watchlist is populated with some url.

**Notes**

- No email will be fired if no new job is found.
- user needs to be logged in Upwork site. If this is not the case, addon will open a new tab to login.

**Configuration thru the addon options panel:**
- right click on the Tellmeupwork icon in the menu bar and select "Options"
- specify email address where to send the reports.
- edit monitored urls list
- select specific job type and experience levels

**Build**

npm-install

gulp watch
