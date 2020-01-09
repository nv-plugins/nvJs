/**
 * nv.table
 * v1.0.0
 * shimuhong 2019/12/05
 */
Nv.add("/static/js/lib/nv.table",function(nv,$,page,column){
    var _table = function () {

    }

    _table.prototype = {
        // 定义初始值
        _obj: {},
        // 指定id下的数据容器
        dataPosition: {},
        // table拿到的当前所有数据列
        list: [],
        // checkbox选中项的数据list
        checkItemList: [],
        _resetData:function () {
            this._obj = {
                // 存储放置table Dom 块的ID, 即传入的ID, 为了尽可能少的操作Dom (带 #)
                $wrapId: null,
                // 传入id的名字 (不带 #)
                idName: null,
                // 外部传入的参数,用于接口请求
                data: {},
                // 传入dataTable的数据对象
                list: [],
                // 定义要显示的所有列
                fields: [],
                // 存储最初的thead Dom
                theadDom: null,
                // 是否显示序号
                showNumber: true,
                // 是否显示多选框
                showCheckbox: true,
                // 操作中的按钮列表
                operation: [],
                page: {
                    // 当前页码
                    pageNo: 1,
                    // 总条数
                    total: 0,
                    // 每页显示条数
                    pageSize: 10,
                },
                // 动态列存储回显状态（存储不显示状态）
                _columnStateList: [],
                // 动态列存储选中状态（存储未选中状态）
                _checkedStateList: [],
            }
        },
        // 初始化方法
        init: function (_n) {
            // 初始话默认数据
            this._resetData()
            // 存储jquery对象id
            this._obj.$wrapId = $(_n.id)
            // 存储id名
            this._obj.idName = _n.id.replace(/#/,'')
            // 赋值给对应id的对象
            this.dataPosition[this._obj.idName] = this._obj
            // 合并传入对象
            Object.assign(this._obj, _n)
            // 调用接口
            this._ajax().then((data)=> {
                typeof _n.callback === 'function' && _n.callback(data)
            }).catch(()=> {
                typeof _n.callback === 'function' && _n.callback({
                    code: "-1",
                    message: "网络异常！",
                    content: null,
                    success: false,
                })
                console.log('初始化表格数据失败')
            })


        },
        // 重载数据
        reload: function (ev = {}) {
            // 初始话默认数据
            this._resetData()
            // 获取对应id 数据对象
            var id_obj = this.dataPosition[ev.id.replace(/#/,'')]
            Object.assign(this._obj, id_obj)
            Object.assign(this._obj.data, ev.data)
            this._ajax().then((data)=> {
                typeof ev.callback === 'function' && ev.callback(data)
            }).catch(()=> {
                typeof ev.callback === 'function' && ev.callback({
                    code: "-1",
                    message: "网络异常！",
                    content: null,
                    success: false,
                })
                console.log('初始化表格数据失败')
            })

        },
        // 请求接口
        _ajax: function () {
            // 输出等待状态图标
            var _warp = this._obj.$wrapId.find('.nv-table-wrap .dataTables_wrapper')
            _warp.length>0 && _warp.append(`
                <div id="${this._obj.idName}_loading" class="nvLoading">
                    <img src="/static/images/loading.gif" />
                </div>
            `)

            return new Promise((resolve, reject) => {
                var _opt = {
                    type: this._obj.type || 'POST',
                    url: this._obj.url,
                    dataType: this._obj.dataType || 'JSON',
                    data: this._obj.data || {},
                }
                $.ajax({
                    ..._opt,
                    success: (data) => {
                        if (data.code === '1') {
                            this.list = this._obj.list = data.content.rows
                            this._obj.page.total = data.content.total
                        }else {
                            this.list = this._obj.list = []
                            this._obj.page.total = 0
                            $(`#${this._obj.idName}_loading`).remove()
                            alert(data.message)
                        }

                        // 更新对应id对象
                        this.dataPosition[this._obj.idName] = this._obj
                        // 输出固定Dom结构
                        this._tableDom()
                        // 输出数据dom结构
                        this._setDataDom()
                        // 初始化page
                        this._initPage()
                        // 加载 DataTable
                        var _tb = this._dataTable()
                        // 列拖动组件
                        this._colResizable()
                        // 更新动态列状态
                        var _column
                        this._obj._columnStateList.forEach((val)=> {
                            _column = _tb.column(val);
                            _column.visible(false);
                        })

                        resolve(data)
                    },
                     error: (xhr, type, errorThrown) => {
                        var _errMsg = {
                            xhr,
                            type,
                            errorThrown,
                        }
                        console.log('_errMsg:', _errMsg)
                         alert('网络开小差，请稍后再试！')
                        reject(_errMsg)
                    }
                })

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
                    var pageIndex = ev.pageNo-1
                    this._obj.data.pageIndex = pageIndex
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
                            `<td class="td_check">
                                <input type="checkbox" name="${this._obj.id}" check-item=${JSON.stringify(_tr)} class="nv-checkbox">
                            </td>` : ``
                        }
                        ${this._obj.showNumber ? `<td class="td_num">${_ind+1}</td>` : ``}
                        ${
                            this._obj.fields.map((_th)=> {
                                // 增加过滤器
                                var _filter = (_th.filters && typeof _th.filters === 'function') ? _th.filters(_tr,_ind) : (_tr[_th.key] || '')
                                return `<td class="th_cont" title="${_filter}">${_filter}</td>`
                            }).join('')
                        }
                        ${
                            this._obj.operation.length>0 ? `<td>${
                                this._obj.operation.map((_event,_indspan)=> {
                                    return `<span data-details=${JSON.stringify(_tr)} data-index="${_ind}" event-index="${_indspan}" event-name="${_event.eventName}" class="span_href">${_event.name}</span>`
                                }).join('')
                            
                            }</td>` : ``
                        }
                    </tr>`
                }).join('')
            var _tbody  = this._obj.$wrapId.find('tbody')
            _tbody.empty().append(_domList)

            // 放置 thead 代码 （此举为解决全选失败问题）
            var _domThead = `
                <tr>
                    ${
                        this._obj.showCheckbox ?
                        `
                        <th class="th_check">
                            <input type="checkbox" name="${this._obj.id}" data-all="true" class="nv-checkbox">
                        </th>` : ``
                    }
                    ${
                        this._obj.showNumber ? `<th class="th_num">序号</th>` : ``
                    }
                     ${
                        this._obj.fields.map((_th, _ind) => `
                        <th th-index="${_ind}" class="th_cont">${_th.name}</th>`).join('')
                    }
                    ${
                        this._obj.operation.length > 0 ? `<th class="th_oper">操作</th>` : ``
                    }
                </tr>
                `
            var _thead  = this._obj.$wrapId.find('thead')
            _thead.empty().append(_domThead)

            // 重载绑定事件
            this._listEvent()
        },
        _tableDom: function () {
            this._obj.$wrapId && 
            this._obj.$wrapId.empty().append(`
                <div class="btnBox">
                    <div class="nv-dropdown nv-dropdown-btn nv-dropdown-right" data-type="click">
                        <a class="nv-dropdown-link" href="javascript:;">设置列
                            <!---->
                            <i class="nv-icon-angle nv-icon-down"></i>
                        </a>
                        <ul class="nv-dropdown-menu rowSelect">
                            ${
                                this._obj.fields.map((_th,_index)=> {
                                    return `<li check-index="${_index}" class="nv-dropdown-item">
                                        <input type="checkbox" ${!this._obj._checkedStateList.includes(String(_index)) ? `checked="checked"` : `` } class="nv-checkbox">
                                        ${_th.name}
                                    </li>`
                                }).join('')
                            }
                        </ul>
                    </div>
                </div>
                <div class="nv-table-wrap nv-table-wrap-border">
                    <table class="table NoColRsizer" id="${this._obj.idName}_table">
                        <thead>
                            <!-- 此内容区在 _setDataDom 方法中重绘 -->
                        </thead>
                        <tbody>
                            <!-- 此内容区在 _setDataDom 方法中重绘 -->
                        </tbody>
                    </table>
                    
                </div>
                <div class="nv-pagination" id="${this._obj.idName}_page"></div>
            
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
                // colReorder: true,//启动列拖动
                paging: false,
                bLengthChange:false,
                autoWidth: false, //自动宽度

                // info: false,
                // stateSave: true,
                //
                // "searching": false,  //不显示datables自带的搜索框
                // "ordering": false,   //不显示datables自带的列排序

                // retrieve: true, // 重新初始化提示（true是不提示）
                // fixedColumns: {
                //     leftColumns: 1,
                //     rightColumns: 1
                // },
                oLanguage:{
                    // oPaginate:{
                    //     "sPrevious": "<i class='nvicon-arrow-left'></i>",
                    //     "sNext": "<i class='nvicon-arrow-right'></i>",
                    // },
                    // "sProcessing" : "正在加载数据，请稍后...",
                    // "sZeroRecords" : "没有数据！",
                    "sEmptyTable" : "未查询到数据！",
                    // "sLoadingRecords": "载入中...",
                },
                // columnDefs:[{
                //     // targets 不显示倒序箭头的index
                //     targets : [0,2,3],
                //     orderable : false
                // }]
            });

            //显示隐藏列
            _wrapId.find('.rowSelect').off('click', 'li .nv-checkbox').on('click', 'li .nv-checkbox', function(ev) {
                // ev.preventDefault()
                // 获取当前Jquery Dom 对象
                var _target = $(ev.target),
                    // 获取当前选中项的自定义下标
                    _ind = _target.parent().attr('check-index')
                // 获取最初thead下th的index
                var _thInd =  __obj.theadDom.find(`th[th-index=${_ind}]`).index()

                // DataTable 实现动态列切换的核心方法s
                var column = table.column(_thInd);
                var _visible = column.visible()
                // 收集列显示状态
                _visible?
                    (!__obj._columnStateList.includes(_thInd) && __obj._columnStateList.push(_thInd))
                :
                    (__obj._columnStateList = __obj._columnStateList.filter(val=> _thInd !== val))

                // 收集列显示状态 _checkedStateList
                _visible?
                    (!__obj._checkedStateList.includes(_ind) && __obj._checkedStateList.push(_ind))
                    :
                    (__obj._checkedStateList = __obj._checkedStateList.filter(val=> _ind !== val))

                // 改变动态列
                column.visible(!_visible);

            })

            // 存储最初的thead Dom, 这个方法服务于动态列,保存最初列的个数以便从中获取原始信息
            __obj.theadDom = __obj.$wrapId.find('thead').clone()

            return table
        },
        // 列拖动组件
        _colResizable: function () {
            // 需要使用全局jquery对象，因为nv 中的jquery 没有绑定 colResizable 方法
            jQuery(`#${this._obj.idName}_table`).colResizable({
                liveDrag:true,
                resizeMode:"overflow",
                partialRefresh:true,
                flush:true,
            })
        },
        _listEvent: function () {
            var _this = this
            var __obj = _this._obj
            var _wrapId = __obj.$wrapId

            // 点击‘操作’触发事件回调函数
            _wrapId.find('tbody').off('click', 'tr [event-name]').on('click', 'tr [event-name]', function(ev) {
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

            var _checkItem = _wrapId.find('tbody tr')
            // 点击checkBox 批量操作
            _wrapId.find('thead').off('click', 'tr [data-all]').on('click', 'tr [data-all]', function(ev) {
                var _isCheckedAll =  $(ev.target).is(':checked')
                // 先清空数据list
                _this.checkItemList.length = 0
                // 如果样式选中将全部push
                if (_isCheckedAll) {
                    _checkItem.each(function(index,dom) {

                        var _dom = $(dom),
                            _item = _dom.find('[check-item]').attr('check-item')

                        var _itemJson = JSON.parse(_item)
                        _itemJson['_lineIndex'] = index
                        // 更新选中的集合
                        _this.checkItemList.push(_itemJson)

                    })
                }

            })

            // 点击checkBox 存取值
            _checkItem.find('[check-item]').off('click').on('click', function(ev) {
                // 清空选中的集合
                _this.checkItemList.length = 0
                // 将选中集合的item添加到list
                _checkItem.each(function(index,dom) {
                    var _dom = $(dom),
                        _item = _dom.find('[check-item]').attr('check-item'),
                        _isChecked = _dom.find('[check-item]').is(':checked')

                    var _itemJson = JSON.parse(_item)
                    _itemJson['_lineIndex'] = index
                    // 更新选中的集合
                    _isChecked && _this.checkItemList.push(_itemJson)

                })
            })

        }
    }


    return new _table()
},{
    requires:["jquery", "page" ,"fixedColumns"],
    alias: 'table'
})