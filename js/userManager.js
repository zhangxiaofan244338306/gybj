layui.use(['laydate', 'laypage', 'layer', 'table', 'carousel', 'upload', 'element'], function() {
	var laydate = layui.laydate,
		laypage = layui.laypage //分页
	layer = layui.layer,
		table = layui.table,
		carousel = layui.carousel,
		upload = layui.upload,
		element = layui.element; //元素操作

	//执行一个 table 实例
	table.render({
		elem: '#test',
		height: 332,
		url: baseUrl + 'api/user/GetUserList',
		limit: 20,
		page: true,
		cols: [
			[ //表头
				{
					field: 'OBJECTID',
					title: 'ID',
					width: 50
				}, {
					field: 'Account',
					title: '登录名',
					width: 100,
				}, {
					field: 'Password',
					title: '登录密码',
					width: 150
				}, {
					field: 'UserName',
					title: '用户名',
					width: 100
				}, {
					field: 'IsAdmin',
					title: '是否管理员',
					width: 100
				}, {
					fixed: 'right',
					width: 200,
					align: 'center',
					toolbar: '#barDemo'
				}
			]
		],
		done: function(res, curr, count) {
			$("[data-field='ID']").css('display', 'none');
		}
	});

	//监听工具条
	table.on('tool(demo)', function(obj) { //注：tool是工具条事件名，test是table原始容器的属性 lay-filter="对应的值"
		var data = obj.data,
			layEvent = obj.event; //获得 lay-event 对应的值
		if(layEvent === 'detail') {
			alert("查看");
		} else if(layEvent === 'edit') {
			alert("编辑");
		} else if(layEvent === 'del') {
			layer.confirm('确认删除该用户吗', function(index) {
				obj.del(); //删除对应行（tr）的DOM结构
				layer.close(index);
				//向服务端发送删除指令
				$.ajax({
					url: baseUrl + 'api/user/DeleteUser?uid=' + data.OBJECTID,
					type: "post",
					success: function(result) {
						var msg = result;
						if(msg.res == "OK") {
							layer.msg('删除成功', {
								icon: 1,
								time: 1000
							}, function() {
								//										location.reload();
							});

						} else {
							layer.msg(msg.res ? msg.res : '删除失败', {
								icon: 2
							});
						}
					},
				});
			});
		}
	});
})