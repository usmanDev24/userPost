#!/bin/bash
CONTAINER_NAME="svc-postbase"
incus launch images:debian/13 $CONTAINER_NAME -c limits.cpu=1 -c limits.memory=1GiB

# -m add home dir -s shell path -G group to add
#incus exec $CONTAINER_NAME -- useradd -m -s /bin/bash -G sudo admin

# sh(dash) -c  Read commands from the command_string operand instead  of from the standard input.
# this is to allow user admin to execute sudo without password.

#incus exec $CONTAINER_NAME -- touch /etc/sudoers.d/admin
#incus exec $CONTAINER_NAME -- sh -c "echo 'admin ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/admin"

#incus exec $CONTAINER_NAME -- su - admin -c 'sudo apt update'

incus exec $CONTAINER_NAME -- bash << 'EOF'
  apt-get update && \
  apt-get install -y git unzip curl && \

  curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
  apt-get install -y nodejs && \

  if command -v ./.bun/bin/bun &> /dev/null ; than
    echo "Bun already installed"
  else 
    echo "Installing bun"
    curl -fsSL https://bun.sh/install | bash - 
  fi
  source /root/.bashrc
  bun --version
  nodejs -v
  npm -v 

  npm install pm2@latest -g 
  pm2 -v
EOF


# -s flag hides the input (silent mode) so the key isn't visible on screen
# -p flag provides a prompt message


read -p "Enter your DOTENV_PRIVATE_KEY_PRODUCTION: " MY_KEY_PRODUCTION && \
incus config set $CONTAINER_NAME environment.DOTENV_PRIVATE_KEY_PRODUCTION="$MY_KEY_PRODUCTION" && \
unset MY_KEY_PRODUCTION

incus exec $CONTAINER_NAME -- bash << 'EOF'
  cd /root/home
  rm -r ./postbase

  git clone https://github.com/UsmanDev24/postbase.git && \
  cd ./postbase && \

  source /root/.bashrc
  bun install && \
  bun run build && \
  bun run init-catg-pro && \

  pm2 start --name postbase bun -- start
EOF

incus exec $CONTAINER_NAME -- bash << 'EOF'
  cd /root/home
  rm -r ./postbase-user-api
  git clone https://github.com/UsmanDev24/postbase-user-api.git && \
  
  source /root/.bashrc
  cd ./postbase-user-api && \
  bun install && \
  bun run build && \
  pm2 start --name postbase-user-api bun -- start && \
  eval $(pm2 startup | grep ^sudo) && \
  pm2 save
EOF

  

