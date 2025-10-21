import * as Knex from 'knex';
import knex from './knex';

interface IParams {
  [key: string]: any;
}

class Base {
  private table: string;

  constructor(props: string) {
    this.table = props;
  }

  // 查找
  all(): Knex.QueryBuilder {
    return knex(this.table).select();
  }

  // 新增
  insert(params: IParams): Knex.QueryBuilder {
    return knex(this.table).insert(params);
  }

  // 更改
  update(id: number | string, params: IParams): Knex.QueryBuilder {
    return knex(this.table).where('id', '=', id).update(params);
  }

  // 删除
  delete(id: number | string): Knex.QueryBuilder {
    return knex(this.table).where('id', '=', id).del();
  }
}

export default Base;