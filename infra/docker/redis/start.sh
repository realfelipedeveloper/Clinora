#!/bin/sh
set -eu
umask 077

acl=/tmp/clinora-users.acl
printf 'user default off\n' > "$acl"

add_user() {
  name=$1
  password=$2
  if [ "${#password}" -lt 16 ]; then
    printf 'Redis local exige senha com pelo menos 16 caracteres.\n' >&2
    exit 1
  fi
  case "$password" in
    *[!A-Za-z0-9._-]*)
      printf 'Redis local aceita apenas letras, numeros, ponto, sublinhado e hifen na senha.\n' >&2
      exit 1
      ;;
  esac
  printf 'user clinora_%s on >%s ~clinora:%s:* +ping +get +set +del +expire +pttl +incr +decr +exists\n' \
    "$name" "$password" "$name" >> "$acl"
}

add_user core "$CLINORA_CORE_REDIS_PASSWORD"
add_user payments "$CLINORA_PAYMENTS_REDIS_PASSWORD"
add_user notifications "$CLINORA_NOTIFICATIONS_REDIS_PASSWORD"
add_user integrations "$CLINORA_INTEGRATIONS_REDIS_PASSWORD"
add_user scheduler "$CLINORA_SCHEDULER_REDIS_PASSWORD"

exec redis-server --bind 0.0.0.0 --protected-mode yes --aclfile "$acl" \
  --dir /tmp --save '' --appendonly no --maxmemory 128mb --maxmemory-policy noeviction
