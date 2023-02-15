# ${mesh_name}
# ${ocir}
# ${docker_username}, ${docker_password} OPTIONAL
cp app.yaml app.yaml.copy
sed -i "s/mesh_name/${mesh_name}/g" app.yaml
sed -i "s|meshdemo_registry|${ocir}|g" app.yaml
kubectl label namespace $mesh_name servicemesh.oci.oracle.com/sidecar-injection=enabled
if [ -n "${docker_username}" ] && [ -n "${docker_password}" ]; then
  echo "Creating docker pull secret for OCIR .."
  kubectl create secret docker-registry ocirsecret -n $mesh_name --docker-server ${ocir} --docker-username ${docker_username} --docker-password ${docker_password}
fi
kubectl create -f app.yaml
mv app.yaml.copy app.yaml