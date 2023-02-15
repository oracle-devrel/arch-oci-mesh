# $1 = home v1 weight
# $2 = home v2 weight
if [ -z "$1" ] || [ -z "$2" ]; then
  exit
fi
cp update-home-VirtualServiceRouteTable.yaml update-home-VirtualServiceRouteTable.yaml.copy
sed -i "s/mesh_name/${mesh_name}/g" update-home-VirtualServiceRouteTable.yaml
sed -i "s/mesh_compartment/${mesh_compartment}/g" update-home-VirtualServiceRouteTable.yaml
sed -i "s/home_v1_weight/$1/g" update-home-VirtualServiceRouteTable.yaml
sed -i "s/home_v2_weight/$2/g" update-home-VirtualServiceRouteTable.yaml
kubectl apply -f update-home-VirtualServiceRouteTable.yaml
mv update-home-VirtualServiceRouteTable.yaml.copy update-home-VirtualServiceRouteTable.yaml
