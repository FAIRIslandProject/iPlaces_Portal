
Master Branch Status: [![Netlify Status](https://api.netlify.com/api/v1/badges/7cc69373-550d-481d-a76b-1e89ce2f816f/deploy-status)](https://app.netlify.com/sites/iplaces-test/deploys)

Develop Branch Status: 


# iPlaces Portal

This portal is forked from the Amphibian Disease Portal. 

New portal design built in Hugo and Javascript with GEOME backend.  Commits to the master and develop branch are watched by netlify and deployed at the following URL addresses:

Master Branch URL: https://iplaces-test.netlify.app/

Develop Branch URL: TBD 

Site v0.0 went live Feb 3rd on Netlify!

# Developers

You can update content in 3 general areas:

 * To customize text content on pages goto the ```content``` folder and update the relevant markdown files. This section contains markdown
 * To customize and create javascript functions goto static/js/{file}.js   This section contains javascript.
 * To customize the behavior of pages, update content in layouts/{section title}/single or list.html . This section contains mainly go syntax
 
Data for the dashboard is served by the AD Portal API: https://github.com/BNHM/AmphibiaWebDiseasePortalAPI

# Running locally
if you have hugo installed you should be able to just type the following at the root directory:

```
hugo server
```
