var data = { free: { price : {}, options : {} }, pro: { price : {}, options : {} }, enterprise: { price : {}, options : {} } };


var pricing = new Vue({
  el: '#pricing',
  data: { data },
  mounted () {
    data.free = {};
    data.free.price = {};
    data.free.options = {};
    data.pro = {};
    data.pro.price = {};
    data.pro.options = {};
    data.enterprise = {};
    data.enterprise.price = {};
    data.enterprise.options = {};
    getPriceFree();
    getPricePro();
    getPriceEnterprise();
  },
  methods:{
  }
})

function getPriceFree(callback) {
    axios
      .get('/free')
      .then(resp => 
            {        
                data.free = resp.data;
                return callback;
            }
        )
     .catch(error => {
            console.log(error)
        })
     .finally(() => { 
            console.log(data.free);
        })
}

function getPricePro(callback) {
    axios
      .get('/pro')
      .then(resp => 
            {        
                data.pro = resp.data;
                return callback;
            }
        )
     .catch(error => {
            console.log(error)
        })
     .finally(() => { 
            console.log(data.pro);
        })
}

function getPriceEnterprise(callback) {
    axios
      .get('/enterprise')
      .then(resp => 
            {        
                data.enterprise = resp.data;
                return callback;
            }
        )
     .catch(error => {
            console.log(error)
        })
     .finally(() => { 
            console.log(data.enterprise);
        })
}