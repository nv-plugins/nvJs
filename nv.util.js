/**
 * nv.util
 * v1.0.0
 * shimuhong 2019/12/23
 */
Nv.add("/static/js/lib/nv.util",function(nv,$){
    var _utilBox = function () {}
    _utilBox.prototype.select = function (ev) {
        var _multiple = false,
            _dt = ev.data,
            _opt = "",
            _isArray = Array.isArray(_dt),
            selected = ev.selected || null,
            _default = ev.default || `<option value="">全部</option>`

        typeof ev.multiple === 'boolean' && (_multiple = ev.multiple)

        if(_isArray) {
            _opt = _dt.map((item)=> {
                return `<option value='${item[ev.valueKey]}' ${selected == item[ev.valueKey]? `selected="selected"` : ``}>${item[ev.nameKey]}</option>`
            })
        } else {
            // 对象的键值对形式
            for(var k in _dt) {
                _opt += `<option value='${k}' ${selected == k? `selected="selected"` : ``} >${_dt[k]}</option>`
            }
        }


        var _sel = `
            <select 
            ${_multiple ? `multiple="multiple"` : ``}
            name="country"
            class="nv-select" >
                ${!_multiple ? _default : ``}
                
                ${_opt}
            </select>
        `
        var $id = $(ev.id)
        $id.append(_sel)
        $id.find('select').off("change").on("change",()=>{
            var _seled = null

            if(_multiple) {
                _seled = []
                var _span = $id.find('.nv-simulation>.nv-select-multiple>span')
                _span.each((ind, dom)=> {
                    _seled.push($(dom).attr('data-value'))
                })
                // closeFun()
            } else {
                _seled = $id.find('.nv-simulation>.nv-select-reception').attr('data-value')
            }

            typeof ev.callback === 'function' && ev.callback(_seled,_multiple)
        })


        // 多选内关闭某项时触发
        if (_multiple) {
            var targetNode = document.querySelector(`${ev.id}`)
            // 观察者的选项(要观察哪些突变)
            var config = { attributes: true, childList: true, subtree: true };

            var callback = function(mutationsList) {
                var _seled = []
                var _span = $id.find('.nv-simulation>.nv-select-multiple>span')
                _span.each((ind, dom)=> {
                    _seled.push($(dom).attr('data-value'))
                })
                typeof ev.callback === 'function' && ev.callback(_seled,_multiple)
            }
            // 创建一个链接到回调函数的观察者实例
            var observer = new MutationObserver(callback);

            // 开始观察已配置突变的目标节点
            observer.observe(targetNode, config);
        }



    }

    return new _utilBox()
},{
    requires:["jquery"],
    alias: 'util'
})