# $1 = home/admin
# $2 = region
# $3 = IP addr
# ${mesh_name}
# ${dns_domain} = DNS domain name
# ${dns_compartment}  OPTIONAL
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ] || [ -z "mesh_name" ] || [ -z "dns_domain" ]; then
  exit
fi
compartment=${mesh_compartment}
if [ -n "${dns_compartment}" ]; then
  compartment=${dns_compartment}
fi
name=$1.${dns_domain}

if [ ! -f "zone-created.txt" ]; then
    oci dns zone create -c ${compartment} --name ${dns_domain} --zone-type 'PRIMARY' --region $2
    touch zone-created.txt
fi
export items=`echo '[{"domain": "'${name}'","is-protected": false,"rdata": "'$3'","rrset-version": "2","rtype": "A","ttl": 1800 }]'`
oci dns record domain update --domain ${name} --zone-name-or-id ${dns_domain} -c ${compartment} --items="${items}" --region $2 --force
