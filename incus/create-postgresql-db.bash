#!/bin/bash
CONTAINER_NAME="psql-db"
incus launch images:debian/13 $CONTAINER_NAME -c limits.cpu=1 -c limits.memory=1GiB


incus exec $CONTAINER_NAME -- apt update
incus exec $CONTAINER_NAME -- apt install postgresql -y 

# pettern: Search for the commented line and replace it with the active instruction
# -i: This stands for "in-place,"  s/find/replace/g : This is the standard stream editor syntax.
incus exec $CONTAINER_NAME -- sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/17/main/postgresql.conf

# Append a new network rule to the bottom of the file
incus exec $CONTAINER_NAME -- bash -c 'echo "host    all             all             0.0.0.0/0               scram-sha-256" >> /etc/postgresql/17/main/pg_hba.conf'

incus exec $CONTAINER_NAME -- bash -c 'echo "host    all              all             ::/0               scram-sha-256" >> /etc/postgresql/17/main/pg_hba.conf'

echo 'Restarting postresql service in 3 seconds...'
sleep 3
incus exec $CONTAINER_NAME -- systemctl restart postgresql
# 1. Collect data on the Host
read -p "Enter db username: " db_username
read -p "Enter password: " db_password
echo ""
# ==============================================================================
# ARCHITECTURAL PATTERN: SECURE REMOTE EXECUTION
# ==============================================================================

# 1. THE QUOTED HEREDOC ('EOF') Boundary Preservation :
#   
#    Why: Single quotes around the start 'EOF' tell the HOST shell to treat the
#    entire block as a literal string. This prevents the host from expanding 
#    variables (like $DB_USER) before they reach the container. If unquoted, 
#    the host tries to fill them locally, resulting in empty values sent to psql.

# 2. THE STDIN CONFLICT: Input Stream Isolation.
#    
#    Why: 'read -p' stays on the host because the container's bash is already 
#    "consuming" this script via stdin (<<). Putting 'read' inside the block 
#    would cause it to "eat" the next line of code as user input, breaking the script.

# 3. ENVIRONMENT INJECTION (--env): The Controller Pattern.
#    
#    Why: We gather secrets on the Host (The Controller) and inject them into 
#    the Container (The Worker) using --env. This keeps the execution logic
#    independent of how the data was actually collected.

# 4. REDIRECTION LOGIC (<< vs >>):
#    - '>>' (Append): Directs command output TO a destination (File/Stream).
#    - '<<' (Heredoc): Directs a block of text INTO a command's input (Stdin).

# 5. DELIMITER MECHANICS:
#    The quotes on the start 'EOF' are a "functional switch" for the shell.
#    The closing EOF is a simple "stop sign." It must match the name exactly
#    (EOF vs _EOF_) but does not need the quotes.
# ==============================================================================

incus exec "$CONTAINER_NAME" \
  --env DB_USER="$db_username" \
  --env DB_PASS="$db_password" \
  -- bash << 'EOF'
    
    # Wait for Postgres to be ready (Polling Pattern)
    until pg_isready; do
      echo "Waiting for Postgres..."
      sleep 1
    done

    # Execute SQL using the injected environment variables
  
    sudo -u postgres psql -c "CREATE USER \"$DB_USER\" WITH PASSWORD '$DB_PASS';"
    sudo -u postgres psql -c "CREATE DATABASE postbase OWNER \"$DB_USER\";"
    sudo -u postgres psql -c "CREATE DATABASE \"postbase-users\" OWNER \"$DB_USER\";"

    ss -tunlp | grep 5432
EOF
incus info $CONTAINER_NAME | grep inet | grep 10