$env:PATH = "C:\Program Files\Git\bin;C:\Program Files\Git\usr\bin;" + $env:PATH
Set-Location "c:\WorkSpace\Code\study\web-nav"
git add index.html
git commit -m "优化导航页面布局，增加卡片间距和尺寸"
git push
