scp -o ProxyCommand="ssh -W %h:%p olly.fr.to -p 39404" pi@192.168.0.7:~/tools/thermostat/database.db .

# or use ssh config to setup a virtual host that contains that info
