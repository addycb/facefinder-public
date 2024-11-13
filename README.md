# 👁️ Pimeyes_Free_POC  
A proof of concept exploit tool to bypass Pimeyes' obfuscation and provide full premium search results.
Despite attempts to contact Pimeyes, no response was received, leading to the publication of the tool.
It enabling retrieval of unobfuscated web links from search results.  
  
This is the site version of the POC, with a graph-based search. I won't handhold with the setup for now, but I:

Deployed the application on a VPS with a LAMP (Linux, Apache, MySQL, Python) stack, utilizing Gunicorn for Python-
based server management, Flask for web application development, and Nginx for efficient reverse proxying.
Used python, javascript, html and css, alongside a redis database (redis for logs and proxy rotation, iirc)

To run it, at the least you need to:
Replace proxyusername and proxypassword with your user/pass in myproxies.py (I used smartproxy.com)
AND
If you want to integrate google api search, Add your Google Custom Search API key and Search Engine ID in main.py

