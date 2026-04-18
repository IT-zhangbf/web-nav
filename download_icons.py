#!/usr/bin/env python3
"""下载所有网站的 favicon 到本地"""
import json
import os
import re
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

# 配置
ICON_DIR = "icons"
LINKS_FILE = "links.json"
TIMEOUT = 10

def get_domain(url):
    """提取域名"""
    match = re.search(r'://([^/]+)', url)
    return match.group(1) if match else None

def download_icon(domain):
    """下载单个图标"""
    if not domain:
        return None
    
    icon_path = os.path.join(ICON_DIR, f"{domain}.png")
    
    # 已存在则跳过
    if os.path.exists(icon_path):
        return domain, True, "已存在"
    
    # 尝试多个图标源
    sources = [
        f"https://icon.horse/icon/{domain}",
        f"https://www.google.com/s2/favicons?domain={domain}&sz=64",
        f"https://favicon.im/{domain}?larger",
    ]
    
    for src in sources:
        try:
            req = urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                data = resp.read()
                if len(data) > 100:  # 有效图标
                    with open(icon_path, 'wb') as f:
                        f.write(data)
                    return domain, True, f"下载成功 ({len(data)} bytes)"
        except Exception as e:
            continue
    
    return domain, False, "下载失败"

def main():
    # 创建图标目录
    os.makedirs(ICON_DIR, exist_ok=True)
    
    # 读取链接
    with open(LINKS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 提取所有域名
    domains = set()
    for cat in data['categories']:
        for link in cat['links']:
            domain = get_domain(link['url'])
            if domain:
                domains.add(domain)
    
    print(f"共 {len(domains)} 个域名需要下载图标")
    
    # 并发下载
    success = 0
    failed = []
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(download_icon, d): d for d in domains}
        for future in as_completed(futures):
            domain, ok, msg = future.result()
            if ok:
                success += 1
                print(f"✓ {domain}: {msg}")
            else:
                failed.append(domain)
                print(f"✗ {domain}: {msg}")
    
    print(f"\n完成: 成功 {success}, 失败 {len(failed)}")
    if failed:
        print(f"失败域名: {failed}")

if __name__ == '__main__':
    main()
