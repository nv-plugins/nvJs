/**
 * nv.ajax
 * v1.0.0
 * shimuhong 2019/12/25
 */
Nv.add("/static/js/lib/nv.ajax",function(nv,$){

        // 请求接口
        var _ajax = function (obj) {
            var _isStr = typeof obj === "string"
            var _options  = {
                type: 'POST',
                dataType: 'JSON',
                contentType: "application/json",
                data: {},
            }
            if (_isStr){
                _options.url =obj
            } else if (typeof obj === 'object'){
                Object.assign(_options, obj)
            }
            return new Promise((resolve, reject) => {
                $.ajax({
                    ..._options,
                    success: (data) => {
                        resolve(data)
                    },
                    error: (xhr, type, errorThrown) => {
                        reject(xhr, type, errorThrown)
                    }
                })

            })
            
        }

    return _ajax || {}
},{
    requires:["jquery"],
    alias: 'ajax'
})