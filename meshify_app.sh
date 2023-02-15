# ${ca_ocid} - See https://docs.oracle.com/en-us/iaas/Content/service-mesh/ovr-getting-started-osok.htm#service-mesh-getting-install-osok
# ${mesh_name}
# ${dns_domain} = DNS domain name
if [ -z "${mesh_name}" ] || [ -z "${dns_domain}" ] || [ -z "${ca_ocid}" ]; then
  exit
fi
cp meshify-app.yaml meshify-app.yaml.copy
cp bind-app.yaml bind-app.yaml.copy
sed -i "s/mesh_name/${mesh_name}/g" meshify-app.yaml
sed -i "s/mesh_compartment/${mesh_compartment}/g" meshify-app.yaml
sed -i "s/mesh_ca_ocid/${ca_ocid}/g" meshify-app.yaml
sed -i "s/mesh_dns_domain/${dns_domain}/g" meshify-app.yaml
sed -i "s/mesh_name/${mesh_name}/g" bind-app.yaml
kubectl create -f meshify-app.yaml
kubectl create -f bind-app.yaml
mv meshify-app.yaml.copy meshify-app.yaml
mv bind-app.yaml.copy bind-app.yaml
