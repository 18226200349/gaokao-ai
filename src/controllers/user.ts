// 引用用户模版数据
import User from "../models/user";

const userController = {
  // showUser 获取用户数据并返回到页面
  showUser: async function (req: any, res: any, next: any) {
    try {
      let userData = await User.all();
      res.json({
        code: 200,
        message: "操作成功",
        data: userData,
      });
    } catch (e) {
      res.json({ code: 0, message: "操作失败", data: e });
    }
  },
};

export default userController;
