/**
 * nv.table
 * v1.0.0
 * shimuhong 2019/12/05
 */
Nv.add("./js/nv.table",function(nv,$,page,column){
    var _table = function (ev) {
        console.log('set table:', nv)
    }

    _table.prototype = {
        // 定义初始值
        _obj: {
            // 存储放置table Dom 块的ID, 即传入的ID, 为了尽可能少的操作Dom (带 #)
            $wrapId: null,
            // 传入id的名字 (不带 #)
            idName: null,
            // 外部传入的参数,用于接口请求
            params: {},
            // 传入dataTable的数据对象
            list: [],
            // 定义要显示的所有列
            fields: [],
            // 存储最初的thead Dom
            theadDom: null,
            // 是否显示序号
            showNumber: false,
            // 是否显示多选框
            showCheckbox: true,
            // 操作中的按钮列表
            operation: [],
            page: {
                // 当前页码
                pageNo: 1,
                // 总条数
                total: 100,
                // 每页显示条数
                pageSize: 10,
            }
        },
        // checkbox选中项的数据list
        checkItemList: [],
        // 初始化方法
        init: function (_n) {
            // 存储Dom
            this._obj.$wrapId = $(_n.id)
            this._obj.idName = _n.id.replace(/#/,'')
            // 合并传入对象
            Object.assign(this._obj, _n)
            // 输出固定Dom结构
            this._tableDom()
            // 调用接口
            this._ajax().then((ev)=> {
                // 加载 DataTable
                this._dataTable()
            }).catch(()=> {
                console.log('初始化表格数据失败')
            })
            
            
        },
        // 重载数据
        reload: function (ev = {}) {
            this._obj.params = ev
            this._obj.page.pageNo = 1
            this._ajax()

        },
        // 请求接口
        _ajax: function () {
            return new Promise((resolve, reject) => {

                // $.ajax({
                //     type: this._obj.type || 'POST',
                //     url: this._obj.url,
                //     dataType: this._obj.dataType || 'JSON',
                //     data: this._obj.data,
                //     success: (data) => {
                //         resolve(data)
                //     },
                //      error: (xhr, type, errorThrown) => {
                //         reject(xhr, type, errorThrown)
                //     }
                // })


                setTimeout(()=>{
                    // 暂时的假数据
                    var _mock = [
                        {number: '111', phone: '13920096666', name: 'shi',time: '2019',type:'1' ,other: 'asda', appId: '123', address: 'afjlsjdlahd', email: 'asd@126.com', discr: 'asdasdasdas'},
                        {number: '222', phone: '13920096666', name: 'zhang',time: '2019',type:'1' ,other: 'asda', appId: '123', address: 'afjlsjdlahd', email: 'asd@126.com', discr: 'asdasdasdas'},
                        {number: '333', phone: '13920096666', name: 'wang',time: '2019',type:'1' ,other: 'asda', appId: '123', address: 'afjlsjdlahd', email: 'asd@126.com', discr: 'asdasdasdas'},
                        {number: '444', phone: '13920096666', name: 'li',time: '2019',type:'1' ,other: 'asda', appId: '123', address: 'afjlsjdlahd', email: 'asd@126.com',  discr: 'asdasdasdas'},
                        {number: '555', phone: '13920096666', name: 'zhao',time: '2019',type:'1' ,other: 'asda', appId: '123', address: 'afjlsjdlahd', email: 'asd@126.com',  discr: 'asdasdasdas'},
                    ]
                    this._obj.list = _mock

                    // 输出数据dom结构
                    this._setDataDom()
                    // 初始化page
                    this._initPage()
                    resolve('resole_')
                }, 2000)
            })
            
        },
        // 初始化 page 分页组件
        _initPage: function () {
            page.init({
                id: `${this._obj.idName}_page`,
                // 当前页码
                current: this._obj.page.pageNo,
                // 总条数
                total: this._obj.page.total,
                // 每页显示条数
                pageSize: this._obj.page.pageSize,
                // 下拉条数组
                pageSizeOptions: [10, 20, 50, 100],
                // 显示总页数
                showPageSize: true,
                // 显示总页数
                showTotalPage: true,
                // 显示手动输入跳转模块
                showJump: false,
                // 显示总条数
                showTotal: true,
                // 点击页码回调函数
                onChange: (ev) => {
                    Object.assign(this._obj.page, ev)
                    
                    this._ajax()
                },
                // 点击每页条数回调
                onShowSizeChange: (ev) => {
                    this._obj.page.pageSize = ev
                    this._ajax()
                }
            })
        },
        // 数据Dom重绘
        _setDataDom: function () {
            var _domList = this._obj.list.map((_tr,_ind)=> {
                    return `<tr>
                        ${
                            this._obj.showCheckbox ?
                            `<td>
                                <input type="checkbox" name="tabelCheck" check-item=${JSON.stringify(_tr)} class="nv-checkbox">
                            </td>` : ``
                        }
                        ${this._obj.showNumber ? `<td>${_ind}</td>` : ``}
                        ${
                            this._obj.fields.map((_th)=> {
                                return `<td>${
                                    // 增加过滤器
                                    (_th.filters && typeof _th.filters === 'function') ? 
                                    _th.filters(_tr,_ind) : _tr[_th.key]

                                }</td>`
                            }).join('')
                        }
                        ${
                            this._obj.operation.length>0 ? `<td>${
                                this._obj.operation.map((_event,_indspan)=> {
                                    return `<span data-details=${JSON.stringify(_tr)} data-index="${_ind}" event-index="${_indspan}" event-name="${_event.eventName}" style="padding: 0 5px;cursor:pointer;">${_event.name}</span>`
                                }).join('')
                            
                            }</td>` : ``
                        }
                    </tr>`
                }).join('')
            var _tbody  = this._obj.$wrapId.find('tbody')
            _tbody.empty().append(_domList)
        },
        _tableDom: function () {
            this._obj.$wrapId && 
            this._obj.$wrapId.append(`
                <div class="btnBox" style="padding:10px;text-align: right;">
                    <div class="nv-dropdown nv-dropdown-btn nv-dropdown-right" data-type="click">
                        <a class="nv-dropdown-link" href="javascript:;">设置列
                            <!---->
                            <i class="nv-icon-angle nv-icon-down"></i>
                        </a>
                        <ul class="nv-dropdown-menu rowSelect" style="width: max-content;">
                            ${
                                this._obj.fields.map((_th,_index)=> {
                                    return `<li check-index="${_index}" style="padding:5px 20px;"  class="nv-dropdown-item">
                                        <input type="checkbox" checked="checked" class="nv-checkbox">
                                        ${_th.name}
                                    </li>`
                                }).join('')
                            }
                        </ul>
                    </div>
                </div>
                <div class="nv-table-wrap nv-table-wrap-border" style="padding: 10px;">
                    <table class="table">
                        <thead>
                            <tr>
                                ${
                                    this._obj.showCheckbox ?
                                    `<th style="text-align: center;">
                                        <input type="checkbox" name="tabelCheck" data-all="true" class="nv-checkbox">
                                    </th>` : ``
                                }
                                ${this._obj.showNumber ? `<th style="text-align: center;">序号</th>` : ``}
                                ${
                                    this._obj.fields.map((_th,_ind)=> `<th style="text-align: center;" th-index="${_ind}">${_th.name}</th>`).join('')
                                }
                                ${
                                    this._obj.operation.length>0 ? `<th style="text-align: center;">操作</th>` : ``
                                }
                            </tr>
                        </thead>
                        <tbody>
                                <!-- 此内容区在 _setDataDom 方法中重绘 -->
                        </tbody>
                    </table>
                    
                </div>
                <div class="nv-pagination" style="padding: 10px;text-align:right;" id="${this._obj.idName}_page"></div>
            
            `);
        },
        _dataTable: function () {
            // --------------------
            var _this = this
            var __obj = _this._obj
            var _wrapId = __obj.$wrapId
            var table = _wrapId.find('.table').DataTable({
                // scrollX: true,
                // scrollCollapse: true,
                paging: false,
                bLengthChange:false,
                autoWidth: true, //自动宽度
                // fixedColumns: {
                //     leftColumns: 1,
                //     rightColumns: 1
                // },
                // oLanguage:{
                //     oPaginate:{
                //         "sPrevious": "<i class='nvicon-arrow-left'></i>",
                //         "sNext": "<i class='nvicon-arrow-right'></i>",
                //     }
                // },
                // columnDefs:[{
                //     // targets 不显示倒序箭头的index
                //     targets : [0,2,3], 
                //     orderable : false
                // }]
            });

            //显示隐藏列
            _wrapId.find('.rowSelect').on('click', 'li .nv-checkbox', function(ev) {
                // ev.preventDefault()
                    // 获取当前Jquery Dom 对象
                var _target = $(ev.target),
                    // 获取当前选中状态
                    // checked = _target.is(':checked'),
                    // 获取当前选中项的自定义下标
                    _ind = _target.parent().attr('check-index')
                    // 获取最初thead下th的index
                var _thInd =  __obj.theadDom.find(`th[th-index=${_ind}]`).index()
                // DataTable 实现动态列切换的核心方法
                var column = table.column(_thInd);
                column.visible(!column.visible());
                
            })
            // 点击操作触发事件回调函数
            _wrapId.find('tbody').on('click', 'tr [event-name]', function(ev) {
                var _target  = $(ev.target)
                var dataDetails = _target.attr('data-details'),
                    eventName = _target.attr('event-name'),
                    eventINdex = _target.attr('event-index'),
                    dataIndex = _target.attr('data-index')
                var _items = {
                    // 详情数据
                    item: JSON.parse(dataDetails),
                    // 事件名
                    eventName,
                    // 事件位置
                    eventINdex,
                    // 当前行位置
                    dataIndex,
                }
                typeof _this.onOperation === 'function' && _this.onOperation(_items, _target)
            })
            
            var _checkItem = _wrapId.find('tbody tr [check-item]')
            // 点击checkBox 批量操作
            _wrapId.find('thead').on('click', 'tr [data-all]', function(ev) {
                var _isCheckedAll =  $(ev.target).is(':checked')
                // 先清空数据list
                _this.checkItemList.length = 0
                // 如果样式选中将全部push
                if (_isCheckedAll) {
                    _checkItem.each(function(index,dom) {
                        var _dom = $(dom),
                            _item = _dom.attr('check-item')
                        // 更新选中的集合
                        _this.checkItemList.push(JSON.parse(_item))

                    })
                }
                console.log('__obj.checkItemList:',_this.checkItemList)
                
            })

            // 点击checkBox 存取值
            _checkItem.on('click', function(ev) {
                
                // 清空选中的集合
                _this.checkItemList.length = 0
                // 将选中集合的item添加到list
                _checkItem.each(function(index,dom) {
                    var _dom = $(dom),
                        _item = _dom.attr('check-item'),
                        _isChecked = _dom.is(':checked')
                    // 更新选中的集合
                    _isChecked && _this.checkItemList.push(JSON.parse(_item))

                })
                console.log('__obj.checkItemList:',_this.checkItemList)
            })
            
            // 存储最初的thead Dom, 这个方法服务于动态列,保存最初列的个数以便从中获取原始信息
            __obj.theadDom = __obj.$wrapId.find('thead').clone()
            
        }
    }

    Nv.table = new _table()
    
    return Nv.table || {}
},{
    requires:["jquery", "page" ,"fixedColumns"],
    alias: 'table'
})