#!/bin/bash

# Nginx配置部署脚本
# 用于将80端口代理到3000端口

echo "🚀 开始配置Nginx代理..."

# 检查是否安装了Nginx
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx未安装，请先安装Nginx"
    echo "Ubuntu/Debian: sudo apt update && sudo apt install nginx"
    echo "CentOS/RHEL: sudo yum install nginx"
    echo "macOS: brew install nginx"
    exit 1
fi

# 备份原有配置
if [ -f /etc/nginx/sites-available/default ]; then
    echo "📦 备份原有Nginx配置..."
    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)
fi

# 选择配置文件
echo "请选择要使用的Nginx配置："
echo "1) 生产环境配置 (nginx.conf)"
echo "2) 开发环境配置 (nginx-dev.conf)"
read -p "请输入选择 (1 或 2): " choice

case $choice in
    1)
        config_file="nginx.conf"
        echo "✅ 选择生产环境配置"
        ;;
    2)
        config_file="nginx-dev.conf"
        echo "✅ 选择开发环境配置"
        ;;
    *)
        echo "❌ 无效选择，使用默认开发环境配置"
        config_file="nginx-dev.conf"
        ;;
esac

# 检查配置文件是否存在
if [ ! -f "$config_file" ]; then
    echo "❌ 配置文件 $config_file 不存在"
    exit 1
fi

# 复制配置文件
echo "📝 部署Nginx配置..."
if [ -d "/etc/nginx/sites-available" ]; then
    # Ubuntu/Debian系统
    sudo cp "$config_file" /etc/nginx/sites-available/gaokao-ai
    sudo ln -sf /etc/nginx/sites-available/gaokao-ai /etc/nginx/sites-enabled/
    
    # 禁用默认站点
    sudo rm -f /etc/nginx/sites-enabled/default
else
    # CentOS/RHEL系统
    sudo cp "$config_file" /etc/nginx/conf.d/gaokao-ai.conf
fi

# 测试Nginx配置
echo "🔍 测试Nginx配置..."
if sudo nginx -t; then
    echo "✅ Nginx配置测试通过"
    
    # 重启Nginx
    echo "🔄 重启Nginx服务..."
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    echo "🎉 Nginx配置完成！"
    echo ""
    echo "📋 服务状态："
    sudo systemctl status nginx --no-pager -l
    echo ""
    echo "🌐 现在可以通过以下地址访问："
    echo "   http://localhost (Nginx代理)"
    echo "   http://localhost:3000 (直接访问React应用)"
    echo "   http://localhost:4001 (直接访问API服务)"
    echo ""
    echo "📝 日志文件位置："
    echo "   访问日志: /var/log/nginx/gaokao-ai-access.log"
    echo "   错误日志: /var/log/nginx/gaokao-ai-error.log"
    
else
    echo "❌ Nginx配置测试失败，请检查配置文件"
    exit 1
fi

echo ""
echo "🔧 常用命令："
echo "   查看Nginx状态: sudo systemctl status nginx"
echo "   重启Nginx: sudo systemctl restart nginx"
echo "   重新加载配置: sudo systemctl reload nginx"
echo "   查看错误日志: sudo tail -f /var/log/nginx/error.log"
