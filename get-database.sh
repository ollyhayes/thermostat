ssh -o ProxyCommand="ssh -W %h:%p olly.fr.to -p 39404" pi@192.168.0.7 "echo '.backup tools/thermostat/backup.db' | sqlite3 tools/thermostat/database.db"
scp -o ProxyCommand="ssh -W %h:%p olly.fr.to -p 39404" pi@192.168.0.7:~/tools/thermostat/backup.db ./database.db

# or use ssh config to setup a virtual host that contains that info
