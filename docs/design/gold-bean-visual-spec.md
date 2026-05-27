# 金豆品牌视觉规范

> 本文档是金豆习惯 App 的品牌视觉资产规范，所有涉及金豆图标的页面和组件必须遵循此规范。

---

## 资产清单

| 文件 | 尺寸 | 用途 | 优先级 |
|------|------|------|--------|
| `src/assets/brand/gold-bean-main.webp` | 1024x1024 (120KB) | 大尺寸展示、庆祝弹窗、空状态插画 | 首选 |
| `src/assets/brand/gold-bean-main.svg` | 1024x1024 | WebP 兜底、需要矢量缩放的场景 | 备选 |
| `src/assets/brand/gold-bean-token.svg` | 128x128 | 行内小图标：余额、按钮、明细行 | 首选 |

---

## 使用场景与尺寸规范

### 大尺寸展示（64px+）

**场景：** GoldBeanCard 主展示区、打卡成功弹窗、空状态插画
**资产：** `gold-bean-main.webp`
**实现：** `<img>` 标签，固定宽高，`object-fit: contain`

```vue
<img :src="beanMainWebp" :width="size" :height="size" alt="" class="gold-bean-img" />
```

### 小尺寸图标（16-48px）

**场景：** 余额显示、明细行图标、TabBar 图标、按钮内嵌
**资产：** `gold-bean-token.svg`
**实现：** `<img>` 标签

### AppIcon 系统

**场景：** TabBar 金豆标签页
**资产：** 内联 SVG 路径（bean 形状）
**实现：** AppIcon.vue 的 `bean` 图标名

---

## 禁止事项

| 禁止 | 替代方案 |
|------|----------|
| 🫘 emoji 作为图标 | 使用 GoldBeanIcon 组件 |
| 纯 CSS 渐变绘制金豆 | 使用品牌 SVG/PNG 资产 |
| 硬编码颜色值（非品牌色） | 使用 CSS 变量 `$bean-gold` |
| SVG 内联且不处理 ID 冲突 | 统一使用 `<img>` 标签 |

---

## 品牌色板

| Token | 色值 | 用途 |
|-------|------|------|
| `$bean-gold` | `#FFB800` | 金豆主色 |
| `$bean-gold-light` | `#FFC56E` | 渐变亮端 |
| `$bean-gold-dark` | `#E08A00` | 渐变暗端 |
| `$bean-shadow` | `rgba(255,184,0,0.35)` | 投影 |
| `$bean-text` | `#E08A00` | 金豆数字文字 |

---

## 组件调用规范

### GoldBeanIcon

```vue
<script setup>
import GoldBeanIcon from '@/components/common/GoldBeanIcon.vue'
</script>

<template>
  <!-- 默认 (24px) -->
  <GoldBeanIcon />

  <!-- 自定义尺寸 -->
  <GoldBeanIcon :size="16" />   <!-- 行内小图标 -->
  <GoldBeanIcon :size="40" />   <!-- 弹窗图标 -->
  <GoldBeanIcon :size="98" />   <!-- 首页主展示 -->

  <!-- 高亮态 (TabBar 选中) -->
  <GoldBeanIcon :size="24" active />
</template>
```

### AppIcon (bean)

```vue
<script setup>
import AppIcon from '@/components/common/AppIcon.vue'
</script>

<template>
  <AppIcon name="bean" />
</template>
```

---

## 替换检查清单

- [ ] `Home.vue` 首页顶栏 🫘 → `<GoldBeanIcon :size="18" />`
- [ ] `Home.vue` CTA 图标 🫘 → `<GoldBeanIcon :size="20" />`
- [ ] `AppIcon.vue` 新增 `bean` 图标
- [ ] `TabBar.vue` `coin` → `bean`
- [ ] `GoldBeanIcon.vue` CSS 绘制 → `<img>` 品牌资产
- [ ] 所有旧金豆图标已替换
- [ ] `npm run build` 通过
