# 金豆习惯 · Golden Beans

金豆习惯是一款以奖励反馈帮助个人坚持每日习惯的网页应用。把“做完一件小事”变成“获得一笔金豆”，再兑换自己设定的奖励，让重复打卡有更直观的进展感。

适合想培养阅读、运动、学习等日常习惯的人，尤其适合喜欢清晰目标与轻量奖励的人。

![金豆习惯的打卡与奖励循环](docs/images/project-overview.svg)

*功能流程示意，非界面截图。金豆是应用内虚拟积分，不是真实货币。*

## 现在可以做什么

- 创建、编辑和归档习惯，在首页区分今日待完成与已完成事项。
- 打卡和补卡，记录连续完成情况与完成率。
- 获得金豆，设置奖励并使用金豆兑换。
- 查看金豆收支账本、习惯统计和兑换记录。
- 通过浏览器本地存储保存数据；存储层包含备份恢复和旧数据迁移逻辑。

## 怎么使用

1. 先建立一两个容易执行的习惯，设定自己的奖励。
2. 完成后打卡，查看金豆余额和连续完成进展。
3. 用金豆兑换奖励，定期回看统计，调整习惯难度。

仓库登记的体验入口：[金豆习惯](https://golden-beans-rosy.vercel.app)。线上服务状态需以实际访问为准。

## 本地运行

```bash
git clone https://github.com/shengshuyuan/golden-beans.git
cd golden-beans
npm ci
npm run dev
```

打开 Vite 输出的本地地址。开发使用 Vue 3、Pinia、Vue Router 和 Vite。

```bash
npm test            # 现有自动化测试
npm run build      # 构建生产静态资源
npm run preview    # 预览构建产物
```

## 数据与当前边界

数据保存在当前浏览器的 localStorage 中，不提供账号登录或跨设备云同步。更换浏览器、清除站点数据或使用隐私窗口，可能导致原记录不可见或丢失；浏览器内的自动备份也不能代替外部备份。

奖励由用户自行定义、兑现；应用只记录积分与兑换结果。

核心规则见 [`src/domain/`](src/domain/)，存储逻辑见 [`appStorage.js`](src/repositories/appStorage.js)，界面入口见 [`src/views/`](src/views/)。
