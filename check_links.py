#!/usr/bin/env python3
"""检查所有导航链接的可用性"""
import json
import re
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
import ssl
import time

# 配置
LINKS_FILE = "links.json"
TIMEOUT = 8
MAX_WORKERS = 20

def check_link(link_info):
    """检查单个链接是否可访问"""
    name, url = link_info['name'], link_info['url']

    try:
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,*/*',
            },
            method='GET'
        )

        with urllib.request.urlopen(req, timeout=TIMEOUT, context=context) as resp:
            status = resp.status
            if 200 <= status < 400:
                return name, url, True, f"✓ 正常 ({status})"
            else:
                return name, url, False, f"✗ 状态码: {status}"
    except urllib.error.HTTPError as e:
        return name, url, False, f"✗ HTTP错误: {e.code}"
    except urllib.error.URLError as e:
        err_msg = str(e.reason)
        if 'Timeout' in err_msg or 'timed out' in err_msg.lower():
            return name, url, False, "✗ 连接超时"
        elif 'Name or service not known' in err_msg or 'No such host' in err_msg:
            return name, url, False, "✗ 域名解析失败"
        else:
            return name, url, False, f"✗ 连接失败: {err_msg[:50]}"
    except Exception as e:
        return name, url, False, f"✗ 错误: {str(e)[:50]}"

def main():
    # 读取链接
    with open(LINKS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 收集所有链接
    all_links = []
    for cat in data['categories']:
        for link in cat['links']:
            all_links.append({'name': link['name'], 'url': link['url'], 'category': cat['category']})

    print(f"开始检查 {len(all_links)} 个链接...")
    print("=" * 80)

    results = {'ok': [], 'failed': []}
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(check_link, link): link for link in all_links}

        completed = 0
        for future in as_completed(futures):
            completed += 1
            name, url, ok, msg = future.result()

            if ok:
                results['ok'].append({'name': name, 'url': url})
                print(f"[{completed}/{len(all_links)}] {msg} - {name}")
            else:
                link = futures[future]
                results['failed'].append({
                    'name': name,
                    'url': url,
                    'category': link['category'],
                    'msg': msg
                })
                print(f"[{completed}/{len(all_links)}] {msg} - {name}")

    elapsed = time.time() - start_time

    print("\n" + "=" * 80)
    print(f"检查完成! 耗时: {elapsed:.1f}秒")
    print(f"✓ 正常: {len(results['ok'])} 个")
    print(f"✗ 失效: {len(results['failed'])} 个")

    if results['failed']:
        print("\n" + "=" * 80)
        print("失效链接列表:")
        print("=" * 80)

        # 按分类分组显示
        failed_by_cat = {}
        for item in results['failed']:
            cat = item['category']
            if cat not in failed_by_cat:
                failed_by_cat[cat] = []
            failed_by_cat[cat].append(item)

        for cat, items in failed_by_cat.items():
            print(f"\n【{cat}】")
            for item in items:
                print(f"  - {item['name']}")
                print(f"    URL: {item['url']}")
                print(f"    原因: {item['msg']}")

        # 保存到文件
        with open('broken_links.json', 'w', encoding='utf-8') as f:
            json.dump(results['failed'], f, ensure_ascii=False, indent=2)
        print(f"\n失效链接已保存到 broken_links.json")

if __name__ == '__main__':
    main()
