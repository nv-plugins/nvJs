/**
 * nv.modal
 * v1.0.0
 * shimuhong 2019/12/12
 */
Nv.add("/static/js/lib/nv.modal",function(nv,$,modal){
    var _modal = function (ev) {}
    _modal.prototype = {
        modelInit: function (_msg = {}) {
           return `
            <div class="nv-modal nv-modal-lg nv-modal-size-lg" id=${_msg.id}>
                <div class="nv-modal-dialog">
                    <div class="nv-modal-content" style="width: ${_msg.width};">
                        <div class="nv-modal-header">
                            <p class="nv-modal-title">
                                <span id="${_msg.id}_title">${_msg.title}</span>
                                <i class="nvicon-close nv-modal-close"></i>
                            </p>
                        </div>
                        <div class="nv-modal-body" id="${_msg.id}_cont" style="height: ${_msg.height};overflow: auto;padding: 10px 5px 32px;">
                        </div>
                        <div class="nv-modal-footer">
                            ${
                                _msg.showCancle && 
                                `
                                <button class="nv-btn nv-btn-default nv-modal-btn nv-modal-cancel" id="${_msg.id}_cancel">
                                    ${_msg.cancleName || '取消'}
                                </button>
                                `
                            }
                            ${
                                _msg.showEnter && 
                                `
                                <button class="nv-btn nv-btn-primary nv-modal-btn nv-modal-enter" id="${_msg.id}_enter">
                                    ${_msg.enterName || '确定'}
                                </button>
                                `
                            }
                            
                            
                        </div>
                    </div>
                </div>
            </div>
            `
        },
        init: function (_set = []) {
            var _body = $("body")
            var _self = this
            _set.forEach((item)=> {
                // 获取文件夹名作为全弹层公用id
                var getId = item.src.split('/').pop()

                // 如果已有弹层dom缓存，则删除重新输出
                var $_id = $(`#${getId}`)
                if($_id.length > 0) {
                    $_id.remove()
                }
                // 输出弹层模板
                _body.append(this.modelInit({
                    id: getId,
                    width: item.width || '',
                    height: item.height || '80vh',
                    title: item.title || '提示信息',
                    showEnter: true, 
                    showCancle: true
                }))
                var _modId = `#${getId}`,
                    $_modId = $(_modId)
                $_modId.find(`${_modId}_cont`)
                .load(item.src + '/index.' + (item.docType || 'vm'),function(ev){
                    $.getScript(item.src + '/index.js');

                    var _modal = null
                    
                    _modal = modal.init(_modId, {
                        top: "",
                        move: true,
                        openCallback: function(ev) {
                            // 将打开弹窗事件发送至 openCallback,bool的形式返回弹窗状态
                            typeof _modal.openCallback === 'function' && _modal.openCallback(_modal.params,true, ev)
                        },
                        closeCallback: function(ev) {
                            // 将关闭弹窗事件发送至 closeCallback,bool的形式返回弹窗状态
                            typeof _modal.closeCallback === 'function' && _modal.closeCallback(_modal.params,false, ev)
                        }
                    })
                    _modal.params = {}
                    // 打开 弹窗的方法,可传入数据对象至params
                    _modal.block = function (ev,data={}) {
                        // 自定义title
                        data.title && $(`${_modId}_title`).text(data.title)
                        Object.assign(_modal.params, ev)
                        _modal.show()
                    }
                    // 关闭 弹窗的方法,可传入数据对象至params
                    _modal.none = function (ev,data={}) {
                        Object.assign(_modal.params, ev)
                        _modal.hide()
                    }
                    // 点击确定触发回调
                    $(`${_modId}_enter`).on('click', function () {
                        typeof _modal.enterCallback === 'function' && _modal.enterCallback(_modal.params)
                        _modal.hide()
                    })
                    // 点击取消触发回调
                    $(`${_modId}_cancel`).on('click', function () {
                        typeof _modal.cancelCallback === 'function' && _modal.cancelCallback(_modal.params)
                    })


                    _self[getId] = _modal

                });
            })
            
        }
    }



    Nv.modal = new _modal()
    
    return Nv.modal || {}
},{
    requires:["jquery","modal"],
    alias: 'modal'
})