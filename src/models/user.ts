import Base from './base'

class User extends Base {
  // 定义参数默认值为 user 表
  constructor(props = 'user'){
    super(props);
  }
}

export default new User();
