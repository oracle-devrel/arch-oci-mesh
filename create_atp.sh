# Install database via OSOK
# $1 = db name
# $2 = db password
if [ -z "$1" ] || [ -z "$2" ]; then
  exit
fi
cp atp.yaml atp.yaml.copy
sed -i "s/mesh_name/${mesh_name}/g" atp.yaml
sed -i "s/mesh_compartment/${mesh_compartment}/g" atp.yaml
sed -i "s/mesh_dbname/$1/g" atp.yaml
kubectl create namespace ${mesh_name}
kubectl create secret generic admin-secret --from-literal=password=$2 -n ${mesh_name}
kubectl create secret generic wallet-secret --from-literal=walletPassword=$2 -n ${mesh_name}
echo "Create ATP instance $1 with kubectl .."
kubectl create -f atp.yaml
echo "Awaiting for the ATP instance $1 become Active .."
spin='-\|/'
tries=0
atp_status_status=""
while [ $tries -le 600 ] && [ "$atp_status_status" == "" ]
do
  i=$(( (i+1) %4 ))
  printf "\r${spin:$i:1}"
  atp_status=$(kubectl get AutonomousDatabases -n ${mesh_name} -o json | jq '.items[] | select(.spec.dbName == "'$1'") | .status' | tr -d '"')
  if [ "$atp_status" != "null" ]; then
    atp_status_status=$(kubectl get AutonomousDatabases -n ${mesh_name} -o json | jq '.items[] | select(.spec.dbName == "'$1'") | .status' | jq '.status.conditions[] | select(.type == "Active") | .type' | tr -d '"')
  fi
  tries=$(( $tries + 1 ))
  #sleep 1
done
echo ""
if [ "$atp_status_status" != "Active" ]; then
  echo "ATP instance $1 does not exist/could not be created."
else
   echo "ATP instance $1 is Active."
fi
mv atp.yaml.copy atp.yaml