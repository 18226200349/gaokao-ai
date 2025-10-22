// 高考报名AI助手服务
import ExcelJS from 'exceljs'

// 模拟高考政策数据
const gaokaoPolicies = {
  // 各省政策
  provinces: {
    '北京': {
      name: '北京',
     报名时间: '2024年11月1日-10日',
      考试时间: '2025年6月7日-8日',
      科目: ['语文', '数学', '外语', '物理', '化学', '生物', '历史', '地理', '政治'],
      特殊要求: '需要具有北京市户籍或学籍'
    },
    '上海': {
      name: '上海',
      报名时间: '2024年10月25日-11月8日',
      考试时间: '2025年6月7日-9日',
      科目: ['语文', '数学', '外语', '物理', '化学', '生物', '历史', '地理', '政治'],
      特殊要求: '需要具有上海市户籍或学籍'
    },
    '广东': {
      name: '广东',
      报名时间: '2024年11月1日-10日',
      考试时间: '2025年6月7日-9日',
      科目: ['语文', '数学', '外语', '物理', '化学', '生物', '历史', '地理', '政治'],
      特殊要求: '需要具有广东省户籍或学籍'
    }
  },
  
  // 历年数据
  historicalData: {
    '2024': {
      北京: {
        报名人数: 50000,
        录取率: '85%',
        本科线: 430
      },
      上海: {
        报名人数: 55000,
        录取率: '88%',
        本科线: 400
      },
      广东: {
        报名人数: 780000,
        录取率: '82%',
        本科线: 430
      }
    }
  }
};

// 高考报名AI助手类
class GaokaoAssistant {
  // 解读政策
  interpretPolicy(province: string): string {
    const policy = gaokaoPolicies.provinces[province as keyof typeof gaokaoPolicies.provinces];
    if (!policy) {
      return `暂未收录${province}的高考政策信息`;
    }
    
    return `\n${policy.name}高考政策:\n报名时间: ${policy.报名时间}\n考试时间: ${policy.考试时间}\n考试科目: ${policy.科目.join(', ')}\n特殊要求: ${policy.特殊要求}`;
  }
  
  // 资格判定
  checkEligibility(province: string, userInfo: any): string {
    const policy = gaokaoPolicies.provinces[province as keyof typeof gaokaoPolicies.provinces];
    if (!policy) {
      return `暂未收录${province}的高考政策信息`;
    }
    
    // 简单的资格判定逻辑
    if (userInfo.province === province || userInfo.schoolProvince === province) {
      return `您符合${province}高考报名资格`;
    } else {
      return `您不符合${province}高考报名资格，${policy.特殊要求}`;
    }
  }
  
  // 志愿预匹配
  matchMajors(interests: string[], province: string): string {
    // 简单的志愿匹配逻辑
    const majorRecommendations = {
      '理工': ['计算机科学与技术', '人工智能', '电子信息工程', '机械设计制造及其自动化'],
      '文史': ['汉语言文学', '历史学', '哲学', '新闻传播学'],
      '经管': ['工商管理', '经济学', '金融学', '会计学'],
      '医学': ['临床医学', '口腔医学', '药学', '护理学']
    };
    
    let recommendations: string[] = [];
    interests.forEach(interest => {
      if (majorRecommendations[interest as keyof typeof majorRecommendations]) {
        recommendations = recommendations.concat(majorRecommendations[interest as keyof typeof majorRecommendations]);
      }
    });
    
    return `\n根据您的兴趣，为您推荐以下专业:\n${recommendations.slice(0, 5).join('\n')}`;
  }
  
  // 风险预警
  warnRisks(province: string, userInfo: any): string {
    const policy = gaokaoPolicies.provinces[province as keyof typeof gaokaoPolicies.provinces];
    if (!policy) {
      return `暂未收录${province}的高考政策信息`;
    }
    
    let risks = [];
    
    // 检查报名时间
    const now = new Date();
    const registrationEndDate = new Date(policy.报名时间.split('-')[1]);
    const daysUntilEnd = Math.ceil((registrationEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEnd < 7) {
      risks.push(`距离${province}高考报名截止日期仅剩${daysUntilEnd}天，请尽快完成报名`);
    }
    
    // 检查资格
    if (userInfo.province !== province && userInfo.schoolProvince !== province) {
      risks.push(`您可能不符合${province}高考报名资格，${policy.特殊要求}`);
    }
    
    return risks.length > 0 ? `\n风险预警:\n${risks.join('\n')}` : '\n暂无风险';
  }
  
  // 生成个性化报名方案
  generatePersonalizedPlan(province: string, userInfo: any, interests: string[]): string {
    const policyInfo = this.interpretPolicy(province);
    const eligibility = this.checkEligibility(province, userInfo);
    const majors = this.matchMajors(interests, province);
    const risks = this.warnRisks(province, userInfo);
    
    const plan = `\n《${province}高考个性化报名方案表》\n==========================\n${policyInfo}\n\n资格判定:\n${eligibility}\n\n志愿预匹配:${majors}\n\n风险预警:${risks}\n\n材料清单:\n1. 身份证原件及复印件\n2. 户口本原件及复印件\n3. 学籍证明\n4. 思想品德考核表\n5. 体检报告\n\n报名流程:\n1. 网上报名\n2. 现场确认\n3. 缴费\n4. 打印准考证\n\n注意事项:\n1. 请在报名截止日期前完成所有步骤\n2. 确保所有材料真实有效\n3. 关注官方通知，及时了解政策变化`;
    
    return plan;
  }
  
  // 生成Excel文件
  async generateExcelPlan(province: string, userInfo: any, interests: string[]): Promise<Buffer> {
    const policy = gaokaoPolicies.provinces[province as keyof typeof gaokaoPolicies.provinces];
    if (!policy) {
      throw new Error(`暂未收录${province}的高考政策信息`);
    }
    
    // 创建工作簿
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('高考报名方案');
    
    // 设置列标题
    worksheet.columns = [
      { header: '项目', key: 'item', width: 20 },
      { header: '详情', key: 'details', width: 50 }
    ];
    
    // 添加数据
    worksheet.addRow({ item: '省份', details: policy.name });
    worksheet.addRow({ item: '报名时间', details: policy.报名时间 });
    worksheet.addRow({ item: '考试时间', details: policy.考试时间 });
    worksheet.addRow({ item: '考试科目', details: policy.科目.join(', ') });
    worksheet.addRow({ item: '特殊要求', details: policy.特殊要求 });
    
    worksheet.addRow({ item: '资格判定', details: this.checkEligibility(province, userInfo) });
    
    // 添加推荐专业
    const majorRecommendations = {
      '理工': ['计算机科学与技术', '人工智能', '电子信息工程', '机械设计制造及其自动化'],
      '文史': ['汉语言文学', '历史学', '哲学', '新闻传播学'],
      '经管': ['工商管理', '经济学', '金融学', '会计学'],
      '医学': ['临床医学', '口腔医学', '药学', '护理学']
    };
    
    let recommendations: string[] = [];
    interests.forEach(interest => {
      if (majorRecommendations[interest as keyof typeof majorRecommendations]) {
        recommendations = recommendations.concat(majorRecommendations[interest as keyof typeof majorRecommendations]);
      }
    });
    
    worksheet.addRow({ item: '推荐专业', details: recommendations.slice(0, 5).join(', ') });
    
    // 添加材料清单
    worksheet.addRow({ item: '材料清单', details: '身份证原件及复印件, 户口本原件及复印件, 学籍证明, 思想品德考核表, 体检报告' });
    
    // 添加报名流程
    worksheet.addRow({ item: '报名流程', details: '1. 网上报名, 2. 现场确认, 3. 缴费, 4. 打印准考证' });
    
    // 添加注意事项
    worksheet.addRow({ item: '注意事项', details: '1. 请在报名截止日期前完成所有步骤, 2. 确保所有材料真实有效, 3. 关注官方通知，及时了解政策变化' });
    
    // 生成Excel文件
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }
}

export default new GaokaoAssistant();