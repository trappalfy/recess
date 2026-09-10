# Recess — бриф на лендинг

Сайт делаем 1 в 1 по референсу — лендингу Nexaris (4 скриншота + промо-видео на 17,7 с). Повторяем композицию, сетку, типографику, палитру, ритм и анимации. Содержимое своё: тексты Recess, свои сгенерированные картинки, временный знак вместо логотипа. Графику, логотипы и тексты референса на сайт не переносим.

## 0. Как читать бриф

Источники правды по приоритету: этот бриф (цифры сняты замерами со скриншотов), затем скриншоты референса, затем видео. Скриншоты — более новая версия шаблона, чем видео: где они расходятся, прав скриншот (список расхождений — приложение B). Видео нужно для анимаций и для блоков, которых нет на скриншотах: второй ряд карточек и слайдер.

В видео страница снята в 3D-перспективе: наклоняется и вращается. Это камера промо-ролика, а не эффект сайта. Страница на сайте всегда плоская.

Все координаты даны для окна 1905×927 CSS px (размер скриншотов, 1 px скриншота = 1 CSS px). x — от левого края окна, y — от верха секции, если не сказано иное. Значения с пометкой ≈ сняты с видео по пропорциям, их подгоняем на глаз.

Скриншоты референса положи в `/reference` (`hero.png`, `features.png`, `solution.png`, `cta.png`) — по ним идёт сверка в разделе 12. В код и на сайт они не попадают.

## 1. Что такое Recess

Recess — рынок на гэп открытия для токенизированных акций на Robinhood Chain. Каждую пятницу на закрытии биржи по каждому тикеру открывается один вопрос: понедельник откроется выше пятничного закрытия или ниже. Ставки идут в пул-тотализатор в USDG: маркетмейкер не нужен, выигравшая сторона делит пул пропорционально ставкам. Ставки принимаются, пока референсная цена стоит; расчёт — по её первой свежей цене (Chainlink), а не по цене пула. Поэтому мем, выкупивший флоат токена, не может сдвинуть результат. Стадия — предзапуск, сайт собирает waitlist.

Правила для любых текстов на сайте, включая заглушки:

- не обещать доходность, не писать APY, earn, profit;
- не выдумывать числа: на сайте либо реальные проверяемые цифры, либо никаких;
- не намекать на связь с Robinhood Markets, не использовать их логотип и фирменный зелёный;
- никаких логотипов компаний — только тикеры текстом;
- не писать first, only, guaranteed;
- слова и формулировки референса не использовать.

## 2. Главное правило по графике

Всё, у чего есть объём, свет, материал или сложная форма, — картинка: сгенерированный WebP/PNG с прозрачным фоном, вставленный через `next/image`. Кодом такие объекты не рисуем — ни CSS, ни SVG, ни canvas/WebGL: так они не получатся. Кодом делаем только плоское.

| Элемент | Как делаем |
|---|---|
| Монеты, волна в hero, чипы-диски, круги в пилюле, плитки на рельсах, сами рельсы, тумблер, колокол, курсор, монета в лотке, тёмная сфера, визуалы слайдов (шар, стопка карт, иконка, чеки) | Картинка (раздел 8) |
| Фон hero, синий фон секций, свечения | CSS-градиенты |
| Зерно | PNG-текстура 256×256 тайлом (4.5) |
| Карточки, пилюля-контейнер, бордеры, линии-коннекторы, дуги, орбиты, точки, штрихи | CSS / inline SVG |
| Скелетон-доска, кнопки, форма, бейджи, полоски прогресса, светящаяся пилюля в слайде 3, иконка приложения в CTA | Код |
| Знак Recess | Inline SVG (раздел 5) |

Картинки только свои, по промтам из раздела 8. Файлы с референса не скачивать, не обводить и не подкладывать. Пока ассетов нет, на месте каждого стоит заглушка точного размера (полупрозрачный прямоугольник с именем файла), чтобы вёрстку можно было сверять; потом просто подменяем файлы в `/public/images`.

## 3. Стек и структура

Next.js (App Router, актуальная версия) + TypeScript + Tailwind CSS v4. Анимации — `motion` (`motion/react`). Шрифты через `next/font/google`: Plus Jakarta Sans (500, 800) и Inter (400, 500, 600). Иконки UI (соцсети, иконки групп слайдера, иконка в бейдже) — `lucide-react`. Картинки — `next/image`, WebP.

```
app/
  layout.tsx            шрифты, метаданные
  page.tsx              собирает секции
  icon.svg              favicon из знака (раздел 5)
  api/waitlist/route.ts
components/
  sections/  Hero.tsx  Features.tsx  Solution.tsx  Showcase.tsx  Cta.tsx  Footer.tsx
  ui/        Mark.tsx  Wordmark.tsx  Badge.tsx  WaitlistForm.tsx  BlurWords.tsx  Reveal.tsx  Float.tsx
  features/  CircleCarousel.tsx  RailTiles.tsx  OrbitDots.tsx  SkeletonBoard.tsx
  showcase/  FeatureSlider.tsx  SlideSide.tsx  SlidePool.tsx  SlideSettle.tsx
lib/tokens.ts
public/images/{hero,features,solution,showcase}/…
public/textures/grain.png
reference/              скриншоты для сверки, не импортировать
```

Порядок работы: токены и шрифты → Hero с заглушками → Features → Solution → Showcase → CTA и футер → анимации → адаптив → подмена заглушек на ассеты → сверка по разделу 12.

## 4. Дизайн-токены

### 4.1 Цвета (сняты пипеткой)

| Токен | Значение | Где |
|---|---|---|
| `ink` | #010320 | тёмный текст и заголовки на белом, тёмная часть формы, бордер поля |
| `body` | #66676C | серый текст на белом, плейсхолдер (на скрине #68676C — тот же) |
| `blue` | #0A68F5 | фон синей секции, синие кнопки, кружки-иконки в бейджах |
| `hero-blue` | #1269EA | центр радиального фона hero |
| `line` | #E2E8F0 | бордеры карточек и бейджей, 1px |
| `line-soft` | #E9EDF3 | дуги и коннекторы в карточке 1, орбиты в карточке 3 |
| `panel` | #000320 | тёмная панель слайдера |
| `white` | #FFFFFF | фон страницы и карточек |
| `teal-top` / `teal-bottom` | #26FADE / #0EE8CC | иконка приложения в CTA |
| `on-blue-80` | rgba(255,255,255,.80) | лид CTA (на синем даёт #CFE2FE) |
| `glass-40` | rgba(255,255,255,.40) | заливка бейджа на синем |
| `glass-8` | rgba(255,255,255,.08) | карточка слайдера на синем |

Ориентиры цвета только для генерации картинок (в коде не используются): круг синий #3AACFF → #2686FE, круг графитовый #3A3C49 → #0E1020, круг сиреневый #CCADFE → #A48CFE.

### 4.2 Типографика

Заголовки — Plus Jakarta Sans 500 (Medium). Вес проверен замером: на 102px ножка «T» 10px, перекладина 9px — ровно Medium; ширина строк совпадает при трекинге около −0.75px. Текст — Inter 400. Регистр заголовков — Title Case, как на скриншотах.

| Роль | Шрифт | Размер | Line-height | Трекинг | Цвет |
|---|---|---|---|---|---|
| H1 в hero | Jakarta 500 | 102px (6.4rem) | 1 | −0.0075em | ink |
| H2 секции Features и CTA | Jakarta 500 | 64px (4rem) | 1.1 | 0 | ink / white |
| H3 в карточке 1 | Jakarta 500 | 76.8px (4.8rem) | 1 | 0 | ink |
| H2 синей секции | Jakarta 500 | 56px (3.5rem) | 1.2 | 0 | white |
| H3 в карточке 4 ≈ | Jakarta 500 | 48px | 1.1 | 0 | ink |
| Название группы в слайдере ≈ | Jakarta 500 | 22px | 1.3 | 0 | white |
| Лид под заголовком | Inter 400 | 18px | 1.4 | 0 | body / on-blue-80 |
| Текст карточек 1 и 4 | Inter 400 | 18px | 1.4 | 0 | body |
| Крупный текст (карточка 2, колонки синей секции) | Inter 400 | 20px | 1.4 | −0.01em | ink / white |
| Текст карточки 3 ≈ | Inter 500 | 18px | 1.4 | 0 | ink |
| Буллеты слайдера ≈ | Inter 400, лид-ин 600 | 15px | 1.5 | 0 | white |
| Бейдж | Inter 400 | 15px | 1 | 0 | ink / white |
| Поле и кнопка формы | Inter 400 | 18px | 1 | 0 | ink, плейсхолдер body; кнопка white |
| Футер | Inter 400 | 16px | 1.4 | 0 | white |

Замеры для сверки: строки H1 идут через 102px, H3 карточки 1 — через 76–77px, H2 синей секции — через 67px, текст 18px — через 25px, текст 20px — через 28px.

### 4.3 Сетка

Контейнер `max-width: 1310px`, по центру (на 1905 — от x=298 до x=1606), боковые поля на узких экранах 24px. Hero и белая секция Features — на белом фоне страницы. Solution, Showcase, CTA и футер — одна синяя секция на всю ширину.

### 4.4 Радиусы и тени

| Элемент | Радиус | Тень / бордер |
|---|---|---|
| Карточки на белом | 32px | только бордер 1px `line`, без тени |
| Пилюля с кругами | 999px | бордер 1px #EEF1F6; тень 0 24px 48px −12px rgba(10,104,245,.14) |
| Синяя секция | 64px 64px 0 0 | — |
| Карточка слайдера | 32px | бордер 1px rgba(255,255,255,.12) |
| Панель списка и тёмная панель | 24px | у панели списка бордер 1px rgba(255,255,255,.16) |
| Форма, бейджи, кнопки | 999px | — |
| Иконка приложения | 24px | 0 14px 30px rgba(0,20,80,.25) |
| Синяя кнопка в карточке 3 | 999px | 0 12px 30px rgba(10,104,245,.35) |

### 4.5 Зерно

В hero шум заметно сильнее (разброс около ±8 уровней на канал), чем в синей секции (около ±5). Текстуру генерируем один раз скриптом и кладём в `public/textures/grain.png`:

```python
import numpy as np
from PIL import Image
rng = np.random.default_rng(7)
noise = np.clip(rng.normal(128, 42, (256, 256)), 0, 255).astype("uint8")
Image.fromarray(noise, "L").save("public/textures/grain.png")
```

Слой зерна: `background: url(/textures/grain.png) repeat; background-size: 256px; mix-blend-mode: overlay; pointer-events: none`. Прозрачность: в hero .35 и только в синей зоне (маска — тот же эллипс, что у фона hero), в синей секции .20. Точные значения подгоняем при сверке.

### 4.6 Движение

```css
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

Появления 0.6–0.9s, ховеры 0.2s. Все тайминги — в разделе 7.

## 5. Временный знак

Логотипа у Recess пока нет, ставим временный знак. Идея: две скруглённые плашки, правая выше левой, и между ними виден зазор по высоте — гэп между пятничным закрытием и открытием в понедельник. Заодно читается как сдвинутая «пауза» — recess. Все места со знаком идут через один компонент `<Mark/>`, чтобы финальный логотип менялся в одном файле. Готовый файл — `recess-mark.svg` рядом с брифом.

```svg
<svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
  <rect x="2"  y="24" width="14" height="18" rx="4"/>
  <rect x="20" y="2"  width="14" height="18" rx="4"/>
</svg>
```

Словесная часть — `recess` строчными, Plus Jakarta Sans 800, трекинг −0.03em. Локап в шапке hero: знак высотой 34px, отступ 10px, слово кеглем 40px; итог ≈160×34, по центру, верх на y=46 (у референса локап 184×34 на y 46–79). Цвет белый.

| Где | Как |
|---|---|
| Шапка hero | локап, белый |
| Бейдж Features | знак высотой 11px, белый, в синем кружке |
| Иконка приложения в CTA | плитка 96×96, радиус 24, вертикальный градиент `teal-top` → `teal-bottom`, белый знак высотой 46px по центру |
| Тёмная сфера в карточке 4 | белый знак высотой 42px поверх картинки сферы |
| Чип на гребне волны | знак `blue` высотой 18px поверх `chip-blank` |
| Favicon (`app/icon.svg`) | белый знак на плитке `blue` с радиусом 25% |

## 6. Секции

### 6.1 Hero

Hero на десктопе — пропорциональный артборд 1905×927. Внешний `<section>` — контейнер (`container-type: inline-size; max-width: 1920px; margin: 0 auto`). Внутри него артборд `position: relative` с единицей `--u: calc(100cqw / 1905)` и высотой `calc(927 * var(--u))`. **Каждое px-значение из таблиц этого раздела умножается на `--u`**: `width: calc(212 * var(--u))`. На 1905 это ровно пиксели скриншота, на других ширинах композиция масштабируется целиком. Исключения, которые не масштабируются: форма (фиксированные 460×59) и минимальный кегль H1. Мобильная раскладка — раздел 9.

**Фон.**

```css
.hero-bg {
  background:
    radial-gradient(ellipse calc(960 * var(--u)) calc(820 * var(--u)) at 50% 0%,
      #1269EA 0%, #1A70EF 24%, #3C85F1 39%, #85B3F6 54%,
      #D0E2FC 68%, #F5F9FF 83%, rgba(255,255,255,0) 100%),
    #FFFFFF;
}
```

Контрольные точки со скриншота, по ним подгоняем стопы. Фон симметричен относительно центра.

| x, y | Цвет | x, y | Цвет |
|---|---|---|---|
| 952, 20 | #1269EA | 952, 520 | #9DC1F7 |
| 720, 30 | #1A70EF | 952, 620 | #D0E0FA |
| 580, 30 | #3C85F1 | 952, 695 | #E9F0FD |
| 440, 30 | #85B3F6 | 952, 820 | #FBFDFF |
| 300, 30 | #D0E2FC | 300, 670 | #FFFFFF |
| 160, 30 | #F5F9FF | 1650, 670 | #FFFFFF |

Точки под волной (y 520–820) частично принадлежат полупрозрачному низу волны, поэтому сначала ставим картинку волны, потом доводим градиент. Зерно — раздел 4.5.

**Слои снизу вверх.**

1. Фон и зерно.
2. `coin-tsla` и `coin-meta` — стоят за волной: низ левой монеты уходит за край волны, нижнюю часть правой закрывает гребень.
3. `ribbon` — волна.
4. `coin-nvda`, `coin-aapl`, чипы, точки, штрихи.
5. Локап, H1, форма.

**Объекты** — рамка видимого объекта, px @1905, умножать на `--u`:

| Ассет | x | y | w | h | Слой |
|---|---|---|---|---|---|
| Локап знака | по центру | 46 | ≈160 | 34 | 5 |
| `ribbon` | 0 | 250 | 1905 | 480 | 3 |
| `coin-tsla` | 543 | 293 | 155 | 200 | 2 |
| `coin-nvda` | 778 | 200 | 212 | 225 | 4 |
| `coin-aapl` | 993 | 108 | 165 | 165 | 4 |
| `coin-meta` | 1205 | 158 | 185 | 175 | 2 |
| `chip-up` (два диска) | 705 | 398 | 88 | 72 | 4 |
| `chip-bell` | 1083 | 250 | 58 | 56 | 4 |
| `chip-blank` + знак | 1395 | 313 | 40 | 40 | 4 |
| `chip-clock` | 473 | 573 | 40 | 40 | 4 |

Картинки лежат на холстах с полями, поэтому после генерации подгоняем `left/top/width` так, чтобы видимый объект совпал с рамкой из таблицы (удобно через overlay со скриншотом).

**Точки и штрихи** (код). Точки — белые кружки с мягким свечением `box-shadow: 0 0 12px rgba(255,255,255,.8)`: (920, 208) ⌀10, (1357, 172) ⌀12, (1301, 473) ⌀8, (935, 497) ⌀4, (1471, 210) ⌀6, (1374, 516) ⌀4, (1407, 540) ⌀3; плюс пунктир из четырёх точек ⌀4 с шагом 17px от (472, 358). Штрихи — линии 1px с градиентом от rgba(255,255,255,.7) к прозрачному, угол ≈ −22°: два параллельных у левого верхнего края `coin-nvda` (≈ 940–975, 180–205), один над `coin-meta` (≈ 1380–1470, 180–210), один слева от `coin-nvda` (≈ 686–752, 283–313), один длинный и едва заметный правее гребня (≈ 1480–1700, 190–260).

**H1** — по центру, две строки, перенос намеренный (`<br/>` или два блочных span):

> Friday Closed.
> Monday Decides.

Кегль `max(56px, calc(102 * var(--u)))`. Для сверки — рамка «чернил» у референса: строка 1 y 604–680, строка 2 y 706–801. Верх заглавных первой строки ставим на y=604. Строки у нас другой длины, поэтому совпадать должны вертикаль и кегль, а не ширина.

Запасной вариант: «The Exchange Sleeps. / The Gap Doesn't.» — он шире, кегль не менять, проверить, что строка помещается.

**Форма** — компонент `WaitlistForm` (раздел 10), фиксированный размер 460×59, по центру, верх на `calc(836 * var(--u))`. Устройство: тёмная пилюля 460×59 цвета `ink`; поверх неё слева белая пилюля-поле шириной 288px на всю высоту с бордером 2px `ink`, текст с отступом 26px; справа на тёмном — кнопка на оставшуюся ширину, текст по центру. Тексты: плейсхолдер `Your email`, кнопка `Join waitlist`.

### 6.2 Features (белая секция, бенто)

Отступ сверху ≈150px от низа hero, снизу ≈140px (по видео).

**Шапка секции.** Светлый бейдж по центру ≈: высота 32px, отступы 0 6px 0 14px, фон #F4F7FB, бордер 1px `line`, текст 15px `ink`, справа кружок ⌀20 `blue` с белым знаком высотой 11px. Текст: `Welcome to Recess`.
H2 через 20px: `One Question per Ticker`.
Лид через 28px: `Every Friday at the close: will Monday open above or below?`
Сетка через 64px (на скриншоте низ лида y=128, верх карточек y=195).

**Сетка.** Два ряда, зазор 20px.
Ряд 1: колонки 740px и 548px, высота ≈736px (на скриншоте карточки обрезаны снизу, по содержимому высота ≈735).
Ряд 2 ≈: колонки 38/62 (≈497px и 791px), высота ≈470px.
Все карточки: белые, радиус 32, бордер 1px `line`, `overflow: hidden`; внутренний отступ 44px в ряду 1 и 36px в ряду 2.

**Карточка 1 (ряд 1, слева).** Координаты от левого верхнего угла карточки.

| Элемент | x | y | Размер | Примечание |
|---|---|---|---|---|
| Пилюля (код) | 154 | 80 | 431×203 | по центру карточки по горизонтали |
| Круги (3 картинки) | 202 / 311 / 420 | 117 | ⌀127 | шаг 109, нахлёст 18 |
| Дуга слева (код) | центр −21 | центр 180 | ⌀190 | обрезается краем карточки |
| Дуга справа (код) | центр 761 | центр 180 | ⌀190 | обрезается краем карточки |
| Коннекторы (код) | 74→154 и 585→666 | 180 | 1px | горизонтальные линии |
| H3 | 44 | верх заглавных ≈381 | 76.8px | три строки |
| Абзац | 44 | ≈18px под H3 | max-width 580 | 18px body |

Дуги и коннекторы — stroke 1px `line-soft`, без заливки. Исходный порядок кругов слева направо: `circle-blue`, `circle-dark`, `circle-lilac`. Слои: средний слот сверху (z 3), левый z 2, правый z 1.

H3 (переносы через `text-wrap: balance`, должно выйти три строки):

> Settles on the Stock, Never the Pool

Абзац:

> Every market resolves on the Chainlink reference price when the feed wakes up. A meme that corners the float can move the pool. It can't move the result.

**Карточка 2 (ряд 1, справа).** Текст сверху слева: x 44, верх строки ≈76, max-width 340px, 20px `ink`:

> A parimutuel pool in USDG for every ticker. No market maker, no order book: the two sides fund each other.

Рельсы — картинка `rails` на всю ширину карточки, прижата к низу, высота 386px (`object-fit: cover; object-position: bottom`). Плитки — четыре картинки 56×56 поверх рельсов, каждая у внутреннего конца своей рельсы. Центры и наклон от левого верхнего угла карточки:

| Плитка | Центр x, y | Поворот | Рельса |
|---|---|---|---|
| `tile-bell` (графит) | 349, 450 | −12° | уходит вправо за край |
| `tile-down` (сиреневая) | 149, 510 | +10° | приходит слева |
| `tile-pool` (синяя) | 366, 590 | −6° | уходит вправо за край |
| `tile-up` (бирюзовая) | 203, 690 | +12° | приходит слева |

После генерации `rails` центры плиток подгоняем под концы реальных рельс на картинке и снимаем с неё траектории движения (раздел 7.6).

**Карточка 3 (ряд 2, слева) ≈ — по видео.** Текст сверху слева: x 36, y 36, max-width 300, Inter 500 18px `ink`:

> Pick a side before the bell. Above or below Friday's close, one tap, straight from your wallet.

Кнопка `Join waitlist` — синяя пилюля высотой 52px, отступы 0 28px, Inter 500 18px белым, тень из 4.4; слева, примерно на 55% высоты карточки. По клику — плавный скролл к форме в CTA (`#waitlist`) и фокус на поле.

Орбиты (код): 4 концентрические окружности, stroke 1px `line-soft`, центр на 45% ширины карточки и на 40px ниже её нижнего края, радиусы 130 / 190 / 250 / 310, обрезаются карточкой. На трёх внешних — по синей точке ⌀10 (`blue`, ореол `0 0 0 4px rgba(10,104,245,.12)`).

**Карточка 4 (ряд 2, справа) ≈ — по видео.** Сверху по центру — скелетон-доска (код): белая карточка 420×150, радиус 16, тень `0 20px 40px rgba(1,3,32,.06)`, три строки — кружок ⌀28 #EEF1F6, тикер (HIMS / NVDA / TSLA) 14px и две полоски 120×10 и 60×10 цвета #EEF1F6. Вся доска `filter: blur(1.5px); opacity: .7`; позади — такая же карточка со сдвигом вверх на 14px и opacity .4. Поверх центра доски — `sphere-dark` ⌀112 с белым знаком (раздел 5).

H3 под доской (x 36, ≈y 250):

> Weekend Prices Are a Rumor

Абзац (max-width 520, 18px body):

> When the exchange is closed, a thin pool is the only price. Recess lets you take a side on the gap without trusting that print.

### 6.3 Solution (синяя секция)

Одна синяя секция на всю ширину включает Solution, Showcase, CTA и футер. Она тоже контейнер с единицей `--u` (как в hero) для объектов по краям. Фон — `blue`, зерно .20 и мягкое свечение сверху по центру: на скриншоте центр вверху светлее (#2478F6–#287AF5 против #0A68F5 по краям) и к y≈640 сходит на нет.

```css
.blue-section {
  background:
    radial-gradient(ellipse 780px 540px at 50% 260px, rgba(255,255,255,.10), rgba(255,255,255,0) 70%),
    #0A68F5;
  border-radius: 64px 64px 0 0;
}
```

Координаты — от верха синей секции (скриншот `solution.png` начинается ровно с её верхнего края):

| Элемент | x | y | Размер | Что |
|---|---|---|---|---|
| `bell` | 860 | 0 | 66×60 | висит над левым гнездом тумблера, касается верхнего края |
| `toggle` | 830 | 40 | 280×155 | |
| `cursor` | 778 | 122 | 70×83 | указывает на тумблер |
| Бейдж | по центру | 262 | 156×43 | |
| H2 | по центру | верх заглавных 352 | max-width 1110 | |
| Левая колонка | правый край 766 | ≈680 | ширина 360 | |
| `tray-coin` | 803 | 670 | 298×210 | |
| Правая колонка | правый край 1503 | ≈668 | ширина 360 | |

Бейдж-стекло: высота 43px, отступы 0 8px 0 18px, заливка `glass-40`, бордер 1px `line`, текст 15px белым, справа кружок ⌀22 `blue` с белой иконкой `Zap` 12px. Текст: `How It Works`.

H2 — без ручных переносов, `text-wrap: balance`, по центру:

> Markets Open at Friday's Close, Stay Open While the Reference Sleeps, and Settle on Its First Fresh Print.

Колонки — 20px белым, обе выровнены по правому краю, как на скриншоте. Ручных `<br>` нет: у референса из-за них висят одиночные слова, это не повторяем.

Левая:

> Pick a ticker and a side: above Friday's close or below it. Stake USDG from your wallet. No account, no margin, nothing to manage.

Правая:

> When the feed prints again, the winning side splits the pool pro rata. The weekend price was a rumor. The open is the answer.

### 6.4 Showcase (карточка со слайдером) ≈ — по видео и нижнему краю на cta.png

Карточка на всю ширину контейнера (x 298–1606), через ≈110px после колонок, высота ≈720px, радиус 32, заливка `glass-8`, бордер 1px rgba(255,255,255,.12), внутренний отступ 22px. Внутри сетка: слева панель списка, справа тёмная панель 639px, зазор 24px. Замер с `cta.png`: тёмная панель x 945–1584, её низ на 22px выше низа карточки.

**Панель списка:** радиус 24, заливка rgba(255,255,255,.04), бордер 1px rgba(255,255,255,.16), отступы 40px 44px. Три группы через 36px. Группа — это кнопка: строка заголовка (белая иконка 20px + название 22px Jakarta 500), под ней буллеты 15px с точкой 4px и отступом 18px, лид-ин жирный (Inter 600). Активная группа — opacity 1, остальные .45, ховер .8.

Группа 1 — `Pick a Side` (иконка `ArrowUpDown`):

- **Above or below:** one question per ticker, asked at every Friday close.
- **One tap:** stake USDG straight from your wallet.
- **Clear cutoff:** bets lock before the reference price wakes up.

Группа 2 — `The Weekend Pool` (иконка `Layers`):

- **Parimutuel:** both sides fund a single pool.
- **No house:** no market maker, no order book, no counterparty.
- **Live split:** the balance between sides updates as stakes come in.

Группа 3 — `Settlement` (иконка `ReceiptText`):

- **Reference, not pool:** results come from the Chainlink feed, not an AMM price.
- **First fresh print:** the market settles on the first reference tick after the weekend.
- **Pro rata:** the winning side splits the pool by stake.

**Тёмная панель:** фон `panel`, радиус 24, `overflow: hidden`, слайды лежат друг на друге абсолютно. Внизу по центру, в 30px от низа, — три полоски прогресса 64×3px с зазором 14px: трек rgba(255,255,255,.22), заливка белая.

Слайд 1 (к группе Pick a Side): три концентрических кольца (код; ⌀280 / 420 / 560, stroke 1.5px rgba(255,255,255,.28), по центру, внешнее обрезается панелью), по центру `orb` ⌀260, под ним фиолетовое свечение `radial-gradient(circle, rgba(164,140,254,.35), transparent 65%)`.

Слайд 2 (к группе The Weekend Pool): `stack` 520×420, прижат к низу по центру. На лицевой карте по центру — `icon-up` ⌀64, под ним `NVDA Pool` (Jakarta 500 28px белым) и `Open until the reference wakes up.` (Inter 15px, белый .7). Сверху за стопкой еле видная сетка (код: линии 1px rgba(255,255,255,.06) с шагом 32px, маска-градиент сверху вниз).

Слайд 3 (к группе Settlement): `receipts` на всю ширину, прижат к верху. Ниже — тонкая рамка-коннектор (код: прямоугольник со скруглением 16, stroke 1px rgba(255,255,255,.18), от низа средней ленты до пилюли) и светящаяся пилюля `Settled` в ≈120px от низа: высота 52px, отступы 0 32px, `linear-gradient(180deg, #5BB0FF, #1E6FF5)`, бордер 1px rgba(255,255,255,.5), `inset 0 1px 0 rgba(255,255,255,.6)`, свечение `0 0 40px rgba(46,132,255,.6)`, текст 20px Inter 500 белым. Пилюля — код, не картинка.

Картинки слайдов генерируются сразу на фоне `panel` (раздел 8), края гасим маской `mask-image: radial-gradient(...)`, чтобы не было стыков.

### 6.5 CTA и футер

Координаты по `cta.png`: y — от низа карточки слайдера (на скриншоте она кончается на y=80), x — от левого края окна при ширине 1905 (умножать на `--u`).

| Элемент | x | y | Размер |
|---|---|---|---|
| Иконка приложения | по центру | 218 | 96×96 |
| H2 | по центру | верх заглавных 377 | 64px |
| Лид | по центру | ≈468 | 18px, `on-blue-80` |
| Форма | по центру | 533 | 460×59 |
| `coin-meta`, крупно | 40 | 263 | 355×347 |
| `coin-tsla`, крупно | 1380 | 555 | ⌀≈405, обрезается низом секции |
| `chip-up` | 325 | 592 | 62×56 |
| `chip-bell` | 1555 | 482 | 52×50 |
| Точки | (400, 550) ⌀12; (1536, 453) ⌀8 | | |
| Копирайт | 300 | 773 | 16px |
| Соцсети | центры x 844 / 916 / 988 / 1060 | центр 780 | ⌀50 |

Тексты:

- H2: `Be There When the Bell Rings`
- Лид: `Join the waitlist for the first weekend board.`
- Форма — тот же компонент, `id="waitlist"`.
- Копирайт: `© 2026 Recess. All rights reserved.`
- Вторая строка, 13px, белый .6 — согласовать перед запуском: `Not affiliated with Robinhood Markets. Not available in the US and other restricted jurisdictions.`
- Соцсети: X, Telegram, GitHub, Docs — ссылки-заглушки `#`. Кружки ⌀50, бордер 1px rgba(255,255,255,.22), иконка 20px белым, между центрами 72px.

Секция `overflow: hidden` — правая монета обрезается нижним краем. От центра иконок соцсетей до низа страницы ≈42px.

## 7. Анимации

Общее: `motion/react`. Появления срабатывают один раз, когда блок вошёл во вьюпорт на 30%. При `prefers-reduced-motion: reduce` — без блюра, сдвигов и бесконечных циклов, только opacity 0→1 за 0.2s; слайдер сам не листается.

**7.1 Загрузка hero.** Порядок из видео: сначала фон, потом иллюстрация проявляется из размытия, слова H1 по одному, форма последней; всё ≈1.2s.

| Старт | Что | Анимация |
|---|---|---|
| 0.00 | фон | виден сразу |
| 0.10 | локап | opacity 0→1, 0.5s |
| 0.15 | волна, монеты, чипы, точки | opacity 0→1, blur 14→0px, scale .97→1, 0.9s ease-out; объекты со сдвигом 0.06s |
| 0.35 | H1 | `BlurWords` (4 слова) |
| 0.95 | форма | opacity 0→1, y 12→0, 0.6s |
| дальше | idle | 7.4 |

**7.2 `BlurWords`** — на всех H1 и H2 (hero, Features, Solution, CTA). Текст режется по словам на inline-block span с сохранением пробелов; каждое слово: opacity 0→1, `filter: blur(10px)` → 0, y 12→0, 0.7s ease-out, шаг 0.08s. Заголовок остаётся обычным текстом для скринридеров.

**7.3 `Reveal`** — бейджи, лиды, карточки бенто, колонки и объекты Solution, карточка слайдера, иконка, лид и форма CTA: opacity 0→1, y 24→0, blur 6→0px, 0.8s ease-out, дети со сдвигом 0.12s.

**7.4 Idle (`Float`)** — синусоида ease-in-out туда-обратно, бесконечно:

| Объект | Сдвиг по y | Поворот | Период | Фаза |
|---|---|---|---|---|
| `coin-nvda` | 12px | ±1.5° | 6.4s | 0 |
| `coin-aapl` | 10px | ±2° | 7.2s | −1.8s |
| `coin-tsla` | 8px | ±1° | 6.8s | −3.1s |
| `coin-meta` | 8px | ±1° | 7.8s | −0.9s |
| Чипы | 6px | 0 | 4.6–5.4s | разные |
| Точки hero | opacity .35 ↔ 1 | — | 2.4–3.6s | разные |

У монет за волной амплитуда не больше 8px, а сами картинки монет целые, с нижней частью, чтобы при движении не показался срез. На видео монета за 0.6s смещается относительно заголовка примерно на 4px — это и есть медленный float.

**7.5 Круги в карточке 1** (`CircleCarousel`). Раз в 2.2s левый круг уходит в правый слот, проходя позади двух других, а они сдвигаются влево на слот (109px). Переход 0.6s ease-in-out. Во время прохода у уходящего круга z 0, scale 1 → .9 → 1, y 0 → −6 → 0. Z-индексы слотов: средний 3, левый 2, правый 1. Вне вьюпорта — пауза. В видео цикл ≈1.6–2s, сам переход ≈0.5s.

**7.6 Плитки на рельсах** (`RailTiles`). Каждая плитка ездит вдоль своей рельсы туда-обратно: ±28px вдоль рельсы, по y следует изгибу (±4px), поворот ±3°, периоды 5.5 / 6.2 / 6.8 / 7.4s, ease-in-out, разные фазы. Траектории — короткие SVG-пути, снятые с картинки `rails` после генерации (`offset-path` или keyframes в motion).

**7.7 Точки на орбитах** (`OrbitDots`). Каждая точка крутится по своему кольцу вокруг его центра: 16 / 22 / 28s за оборот, linear, направления чередуются.

**7.8 Solution.** H2 — `BlurWords`, остальное — `Reveal`. Idle: `bell` y ±8px 3.8s; `cursor` x и y ±4px 2.6s, как будто нажимает на тумблер; `toggle` y ±5px 7s; `tray-coin` y ±6px 5.2s.

**7.9 Слайдер** (`FeatureSlider`).

- Автопрокрутка 4s на слайд; стартует, когда карточка на 40% во вьюпорте; вне вьюпорта — пауза.
- Прогресс: активная полоска заполняется линейно за 4s, пройденные остаются полными, следующие пустые; на новом круге все сбрасываются.
- Смена 0.7s ease-in-out: новый слайд въезжает снизу (y 100% → 0), старый уходит вверх (y 0 → −18%, opacity 1 → 0, scale 1 → .96) — так в видео.
- Группы слева синхронизированы со слайдами (opacity .45 ↔ 1 за 0.4s). Клик по группе или по полоске — переход к слайду и перезапуск таймера.
- Внутри слайдов: свечение под `orb` пульсирует (opacity .6 ↔ 1, 3s), `stack` плавает ±4px, `receipts` покачиваются ±4px.

**7.10 CTA.** Иконка: opacity 0→1, scale .9→1, 0.6s. H2 — `BlurWords` через 0.15s. Лид и форма — `Reveal` через 0.6s. Монеты въезжают через 0.2s: левая x −80 → 0, правая y +100 → 0, opacity 0→1, 1.1s ease-out; дальше idle из 7.4.

**7.11 Ховеры и фокус.** Тёмная кнопка формы — фон #0D1238; синяя кнопка — #1F77F7 и тень плотнее; соцсети — фон rgba(255,255,255,.1); всё за 0.2s. `:focus-visible` — обводка 2px `blue` (на синем — белая) с отступом 3px.

## 8. Ассеты

### 8.1 Как генерировать

1. Генерируем в GPT (у него есть прозрачный фон) или в Gemini. Gemini прозрачность не отдаёт — там фон строго плоский белый #FFFFFF, потом вырезаем.
2. Вырезаем фон: `rembg` (`pip install rembg`, затем `rembg i in.png out.png`), remove.bg или Photoshop. Края проверяем и на белом, и на #0A68F5.
3. Теней «на полу» в картинках нет; если тень нужна, даём CSS `drop-shadow`.
4. Тикеры на монетах проверяем по буквам. Если генератор исказил буквы, генерируем монету с пустым лицом и ставим тикер в Figma с перспективой под наклон лица, потом экспорт.
5. Исключения из прозрачности: всё, что лежит на тёмной панели слайдера (`orb`, `stack`, `icon-up`, `receipts`), генерируем сразу на плоском #000320 и не вырезаем — у светящихся объектов вырезка портит свечение; края гасим CSS-маской. `rails` генерируем на белом и тоже не вырезаем — карточка белая.
6. Экспорт: WebP с альфой, качество 90, размер 2× от показа (таблица 8.2); PNG-мастера храним рядом.
7. Все монеты делаем в одной сессии с одним стилевым блоком; если одна выбивается, перегенерируем только её.

### 8.2 Список

| # | Файл | Где | Показ, px | Экспорт, px | Фон |
|---|---|---|---|---|---|
| 1 | hero/ribbon.webp | hero, волна | 1905×480 | 3840×968 | прозрачный |
| 2 | hero/coin-tsla.webp | hero слева; CTA справа крупно | 155×200; ⌀405 | 900×900 | прозрачный |
| 3 | hero/coin-nvda.webp | hero, центр | 212×225 | 600×600 | прозрачный |
| 4 | hero/coin-aapl.webp | hero, сверху | 165×165 | 500×500 | прозрачный |
| 5 | hero/coin-meta.webp | hero справа; CTA слева крупно | 185×175; 355×347 | 900×900 | прозрачный |
| 6 | hero/chip-up.webp | hero, CTA | 88×72 | 300×250 | прозрачный |
| 7 | hero/chip-bell.webp | hero, CTA | 58×56 | 200×200 | прозрачный |
| 8 | hero/chip-clock.webp | hero | 40×40 | 160×160 | прозрачный |
| 9 | hero/chip-blank.webp | hero, под знак | 40×40 | 160×160 | прозрачный |
| 10 | features/circle-blue.webp | карточка 1 | ⌀127 | 300×300 | прозрачный |
| 11 | features/circle-dark.webp | карточка 1 | ⌀127 | 300×300 | прозрачный |
| 12 | features/circle-lilac.webp | карточка 1 | ⌀127 | 300×300 | прозрачный |
| 13 | features/rails.webp | карточка 2 | 548×386 | 1100×780 | белый |
| 14 | features/tile-bell.webp | карточка 2 | 56×56 | 180×180 | прозрачный |
| 15 | features/tile-down.webp | карточка 2 | 56×56 | 180×180 | прозрачный |
| 16 | features/tile-pool.webp | карточка 2 | 56×56 | 180×180 | прозрачный |
| 17 | features/tile-up.webp | карточка 2 | 56×56 | 180×180 | прозрачный |
| 18 | features/sphere-dark.webp | карточка 4 | ⌀112 | 260×260 | прозрачный |
| 19 | solution/toggle.webp | Solution | 280×155 | 700×400 | прозрачный |
| 20 | solution/bell.webp | Solution | 66×60 | 200×200 | прозрачный |
| 21 | solution/cursor.webp | Solution | 70×83 | 200×240 | прозрачный |
| 22 | solution/tray-coin.webp | Solution | 298×210 | 700×500 | прозрачный |
| 23 | showcase/orb.webp | слайд 1 | ⌀260 | 600×600 | #000320 |
| 24 | showcase/stack.webp | слайд 2 | 520×420 | 1100×900 | #000320 |
| 25 | showcase/icon-up.webp | слайд 2 | ⌀64 | 180×180 | #000320 |
| 26 | showcase/receipts.webp | слайд 3 | 600×300 | 1300×650 | #000320 |
| 27 | textures/grain.png | hero, синяя секция | тайл 256 | 256×256 | скрипт из 4.5 |

### 8.3 Стилевой блок

Ставится в начало каждого промта, чтобы весь набор был одним семейством. Композиция у каждого ассета своя; одинаковый шаблон только у плиток, потому что это набор одинаковых объектов.

```
Premium 3D fintech illustration asset. Glossy blue enamel, frosted glass and polished blue metal. Soft studio light from the upper left, gentle rim light on the right edge, subtle inner glow, crisp clean edges, high detail, no grain. Palette: electric blue #0A68F5, sky blue #3AACFF, periwinkle #8FA9FF, deep indigo #1B2A8F, teal #19E3B1, lilac #B79CFF, pearl white. One isolated object with generous empty margin around it, no ground, no cast shadow, no environment reflections, no text except what is specified, no logos, no watermark. Background: transparent; if transparency is not supported, perfectly flat pure white #FFFFFF.
```

Для ассетов тёмной панели последнее предложение заменить на `Background: perfectly flat solid color #000320.` Для `rails` — на `Background: perfectly flat pure white #FFFFFF.`

### 8.4 Промты

**1. ribbon** — в кадре заложено место под заголовок.

```
A wide flowing 3D surface, like a smooth frosted-white glass ribbon or a soft hill, running across the entire width of the frame. It enters from the left edge at about 40% of the frame height, dips gently at one third of the width, rises into one broad rounded crest at about two thirds of the width, then slopes down and leaves the right edge at about 65% height. The top face is pale white-blue with very fine parallel diagonal hairlines, like a delicate engraved grid; a thin bright highlight runs along the crest. Under the top face a second translucent pale-blue band follows the same curve and softly dissolves downward. Seen slightly from above. Ultra-wide 4:1 composition. Everything above the surface stays completely empty, because objects will be placed there later. The bottom 30% of the frame fades smoothly to pure white, because a large headline will sit there. Nothing on the surface.
```

Если генератор не даёт 4:1 — генерируем 21:9 и расширяем по бокам (outpaint), не растягиваем.

**2. coin-nvda**

```
A thick 3D coin seen at a three-quarter angle, its face turned toward the viewer and tilted slightly upward, as if rolling forward. Face: periwinkle-to-electric-blue gradient enamel with a raised inner ring. Rim: thick polished blue metal with fine vertical reeding and a bright white highlight along the upper left edge. In the center the letters "NVDA" deeply engraved in a bold geometric sans-serif, slightly darker, with a soft inner shadow. Exactly four letters: N, V, D, A. Square canvas, the coin fills 80% of it.
```

**3. coin-aapl**

```
A 3D coin leaning back about 35 degrees, its face angled up and to the left. Face: deep teal to ocean-blue gradient with a pale mint inner ring and a glassy sheen. Rim: thick indigo-blue metal, visible on the lower right. In the center the letters "AAPL" embossed in white, bold geometric sans-serif. Exactly four letters: A, A, P, L. Square canvas, the coin fills 75%.
```

**4. coin-tsla**

```
A 3D coin standing upright on its edge, turned about 30 degrees to the right, so its face reads as a tall ellipse. Face: deep indigo and royal blue enamel with two thin concentric rings in light periwinkle. Rim: thick glossy electric-blue side with a bright white highlight along the left edge. In the center the letters "TSLA" embossed in pale periwinkle, bold geometric sans-serif. Exactly four letters: T, S, L, A. The whole coin is visible, including its bottom edge. Portrait 3:4 canvas, the coin fills 80% of the height.
```

**5. coin-meta**

```
A 3D coin standing almost upright and facing slightly to the left. Face: pearl white with a soft blue gradient toward the edge and a thin electric-blue inner ring. Rim: thick electric-blue metal with a darker blue side visible on the left. In the center the letters "META" embossed in electric blue, bold geometric sans-serif. Exactly four letters: M, E, T, A. The whole coin is visible, including its bottom edge. Square canvas, the coin fills 80%.
```

**6. chip-up**

```
Two small glossy 3D disc buttons overlapping. The front disc is electric blue with a thin white upward-arrow line glyph, tilted slightly toward the viewer, with a dark navy edge. A smaller mint-teal disc sits behind its upper right edge, half hidden. Soft glassy highlights. Landscape 5:4 canvas.
```

**7. chip-bell**

```
A small glossy 3D disc button in electric blue with a thin white outline bell glyph, tilted slightly. A tiny white round badge with a small blue dot sits on its upper right edge. Square canvas.
```

**8. chip-clock**

```
A tiny frosted white glass disc, almost flat, with a thin periwinkle outline clock glyph and a soft pale-blue rim. Very light and airy. Square canvas.
```

**9. chip-blank**

```
A tiny frosted white glass disc, almost flat, with a soft pale-blue rim and a completely empty face; a logo will be placed on it later. Square canvas.
```

**10–12. Круги** — все три одной камерой, строго анфас, в одной сессии.

```
A glossy disc button seen perfectly head-on, very slightly domed, smooth gradient from sky blue #3AACFF at the upper left to #2686FE at the lower right, a soft white highlight near the top, a faint darker ring at the edge. In the center a thin white outline icon of a bell (line icon, even 2px strokes, rounded caps). Square canvas, the disc fills 90%.
```

Для `circle-dark`: градиент графитовый #3A3C49 → #0E1020, иконка — линия пульса внутри маленького круга (живой фид цены). Для `circle-lilac`: градиент #CCADFE сверху → #A48CFE снизу, иконка — две вертикальные стрелки рядом, одна вверх, другая вниз.

**13. rails** — верх кадра чистый, чтобы картинка сливалась с карточкой.

```
Top view, slightly tilted, of a clean white matte surface with four soft pill-shaped grooves pressed into it. Each groove is wide and shallow, gently curved like a slider track, with a subtle inner shadow and a faint pale-blue light along its lower lip. They alternate: the first groove starts just right of the center and runs off the right edge; the second comes in from the left edge and ends a little left of the center; the third starts right of the center and runs off the right edge; the fourth comes in from the left edge and ends near the center. The grooves are empty. The top edge of the frame is plain white. Aspect ratio 10:7.
```

**14–17. Плитки** — общий шаблон, у каждой свой угол, цвет и иконка:

```
A glossy 3D rounded-square app icon tile, tilted {ANGLE} and slightly toward the viewer, {COLOR} gradient, crisp bevel, soft inner glow, a thin white outline icon of {GLYPH} in the center (line icon, rounded caps). Square canvas, the tile fills 70%.
```

| Файл | {ANGLE} | {COLOR} | {GLYPH} |
|---|---|---|---|
| tile-bell | 12 degrees counterclockwise | graphite #3A3C49 to #0E1020 | a bell |
| tile-down | 10 degrees clockwise | lilac #CCADFE to #A48CFE | a downward arrow |
| tile-pool | 6 degrees counterclockwise | sky blue #3AACFF to #2686FE | a stack of three coins |
| tile-up | 12 degrees clockwise | teal #26FADE to #0BBF98 | a rising chart line |

**18. sphere-dark**

```
A glossy dark sphere button seen head-on, near-black navy #0B0D1E, soft highlight at the top, thin subtle rim light, completely empty face; a logo will be placed on it later. Square canvas, the sphere fills 90%.
```

**19. toggle** — место над левым гнездом оставлено под `bell`.

```
A 3D glossy capsule-shaped toggle switch lying diagonally from upper left to lower right, seen from above at an angle. Electric blue body with a darker indigo underside and a thin light edge. Two round sockets on its top: the left socket glows with a soft cyan-white light ring and is empty in the middle; the right socket holds a small white glossy knob. The space above the left socket stays empty, because a small floating object will be placed there. Landscape 16:9 canvas, the object fills 85% of the width.
```

**20. bell**

```
A small faceted teal glass bell floating in the air, slightly tilted, crisp facets with mint highlights and a darker teal core, a tiny clapper visible at the bottom. Square canvas.
```

**21. cursor**

```
A chunky 3D mouse pointer arrow in glossy pearl white, tilted so it points up and to the right, soft rounded edges, subtle blue-tinted shading. Square canvas.
```

**22. tray-coin**

```
A glossy 3D coin standing upright and partly sunk into a rounded cloud-shaped tray slot, as if it is being dropped in. The coin has a periwinkle-blue face with a bold white up-and-down double arrow glyph. The tray is frosted white-blue with soft rounded forms and a row of five tiny indicator dots along its front edge. Seen slightly from above. Landscape 3:2 canvas.
```

**23. orb**

```
A glowing lilac glass orb seen head-on, soft inner light, a gentle highlight at the top, and in the center a white embossed glyph of two vertical arrows side by side, one pointing up and one pointing down; a faint violet glow spills from its lower edge into the dark background. Square canvas, the orb fills 70%.
```

**24. stack** — лицевая карта пустая под HTML-текст.

```
Five dark smoked-glass cards standing upright in shallow perspective, fanned like a deck: one large card in front and centered, the others peeking out on both sides, a little lower and smaller. Thin cool grey light edges, glossy reflections. The front card's face is empty and dark, because text will be placed on it. A faint square grid glows softly behind the top of the stack. Canvas 5:4.
```

**25. icon-up**

```
A glossy mint-green disc icon with a white upward arrow glyph, seen head-on, with a soft green glow around it. Square canvas, the disc fills 60%.
```

**26. receipts** — низ кадра пустой под пилюлю.

```
Three strips of dark receipt paper hanging from the top edge of the frame, with zigzag torn bottom edges. The middle strip is longer and slightly brighter, with three short printed grey lines of different lengths; the side strips are dimmer and partly cropped by the frame. Soft light from above. The lower half of the frame is empty dark space, because a button will be placed there. Canvas 2:1.
```

## 9. Адаптив

| Ширина | Что меняется |
|---|---|
| ≥1280 | всё как в брифе; hero и объекты синей секции масштабируются через `--u` |
| 1024–1279 | та же раскладка, включаются минимальные кегли из клампов |
| 768–1023 | бенто в одну колонку, колонки Solution стопкой, слайдер стопкой |
| <768 | мобильный hero, всё в одну колонку |

Клампы: H1 — `max(56px, calc(102 * var(--u)))` на десктопе и 44px на мобиле; H2 Features и CTA — `clamp(36px, 6vw, 64px)`; H3 карточки 1 — `clamp(40px, 7vw, 76.8px)`; H2 Solution — `clamp(30px, 5vw, 56px)`; H3 карточки 4 — `clamp(30px, 4.5vw, 48px)`.

**Hero <768.** Высота по контенту. Сверху локап (top 24). Под ним блок иллюстрации 100vw × 72vw: `ribbon` шириной 180vw по центру (чтобы был виден гребень), `coin-nvda` left 18vw top 10vw w 30vw, `coin-aapl` left 48vw top 2vw w 24vw, `coin-meta` left 68vw top 12vw w 26vw (за волной), `chip-up` left 8vw top 34vw w 12vw. `coin-tsla`, остальные чипы и штрихи скрыты. H1 44px, форма на всю ширину (max 460), высота 54, поле 60% и кнопка 40%.

**Features <1024.** Карточки в колонку, высота по контенту с минимумами: карточка 1 — 620, карточка 2 — 560 (рельсы 320), карточка 3 — 420, карточка 4 — 460. На <480 пилюля с кругами — scale .8.

**Solution <1024.** Группа тумблера — scale .7. Колонки стопкой: текст, `tray-coin`, текст; текст по центру, max-width 480.

**Showcase <1024.** Сначала список (все группы видны, активная подсвечена, группы нажимаются), под ним тёмная панель высотой 440.

**CTA <768.** Монеты на 50% размера и частично за краями (левая left −40px, правая right −60px), чипы скрыты. Футер: соцсети сверху, копирайт снизу, всё по центру.

## 10. Форма waitlist

Один компонент `WaitlistForm` в двух местах: hero и CTA (`id="waitlist"`). Запрос — POST `/api/waitlist` с `{ email }`.

- Валидация на клиенте и на сервере: формат email, максимум 254 символа.
- Скрытое поле-ловушка `company`: если заполнено, отвечаем 200 и ничего не пишем.
- Хранилище пока заглушка: пишем в лог и отвечаем 200. Точка расширения — адаптер (Resend Audiences или таблица Supabase `waitlist(email unique, source, created_at)`), выбор через env `WAITLIST_PROVIDER`.
- Повторный email — тоже 200, для пользователя это успех.
- Лимит: не больше 5 запросов в минуту с одного IP.

| Состояние | Что видно |
|---|---|
| Обычное | плейсхолдер `Your email`, кнопка `Join waitlist` |
| Отправка | кнопка `Joining…`, форма заблокирована |
| Успех | вместо формы пилюля того же размера: галочка и `You're on the list.`; вторая форма на странице тоже показывает успех (общий стейт + `localStorage`) |
| Неверный email | под формой 14px: `Enter a valid email address.` (на белом #C81E1E, на синем #FFD7D7) |
| Ошибка сервера | `Couldn't save your email. Try again in a minute.` |

Поле: `type="email"`, `autocomplete="email"`, скрытый `<label>` Email.

## 11. Доступность, SEO, скорость

- Один `h1` в hero; H2 — заголовки секций; H3 — заголовки карточек. Группы слайдера — `button` с `aria-controls`; у панели слайдов `aria-live="off"`, пока идёт автопрокрутка.
- Декоративные картинки — `alt=""` и `aria-hidden`. Локап — ссылка с `aria-label="Recess"`.
- Контраст: лид CTA на 80% белого даёт ≈3.7:1 — как у референса, но ниже AA для 18px. Для 1 в 1 оставляем 80%; если нужна AA — белый 100% (≈4.9:1).
- Метаданные: title `Recess — Take a Side on the Open`, description `One question per ticker at every Friday close: above or below at the open? Settled on the reference price, not the pool.` OG-картинка — позже, favicon из знака.
- Картинки hero — `priority`, остальные ленивые; у каждой заданы `width` и `height`, чтобы вёрстка не прыгала. Общий вес картинок ≤1.6 МБ. Шрифты — `display: swap`.

## 12. Приёмка

1. Скриншоты Playwright на 1905×927 в тех же положениях, что у референса: hero (скролл 0), Features (заголовок на y=17), Solution (верх синей секции на y=0), CTA (низ карточки слайдера на y=80). Наложить на `/reference/*.png` с прозрачностью 50%.
2. Допуски: положения ±4px; кегли и цвета — точно по разделу 4.
3. Анимации сверить с видео: порядок загрузки hero ≤1.3s, `BlurWords` на всех H1 и H2, смена кругов, плитки, орбиты, слайдер (4s, полоски, въезд снизу), вход CTA.
4. 390×844 и 834×1194: нет горизонтального скролла, иллюстрация не залезает на H1.
5. `prefers-reduced-motion`: нет блюра, сдвигов и циклов.
6. Нет ни одного текста, логотипа или картинки референса; нет крипто-логотипов, логотипов компаний и символики Robinhood; тикеры на монетах без ошибок.
7. Lighthouse: Performance ≥90, Accessibility ≥95 (кроме лида CTA, если оставили 80%).

## Приложение A. Все тексты по слотам

| Слот | Текст |
|---|---|
| Hero, H1 | Friday Closed. / Monday Decides. |
| Hero, форма | Your email / Join waitlist |
| Features, бейдж | Welcome to Recess |
| Features, H2 | One Question per Ticker |
| Features, лид | Every Friday at the close: will Monday open above or below? |
| Карточка 1, H3 | Settles on the Stock, Never the Pool |
| Карточка 1, текст | Every market resolves on the Chainlink reference price when the feed wakes up. A meme that corners the float can move the pool. It can't move the result. |
| Карточка 2, текст | A parimutuel pool in USDG for every ticker. No market maker, no order book: the two sides fund each other. |
| Карточка 3, текст | Pick a side before the bell. Above or below Friday's close, one tap, straight from your wallet. |
| Карточка 3, кнопка | Join waitlist |
| Карточка 4, H3 | Weekend Prices Are a Rumor |
| Карточка 4, текст | When the exchange is closed, a thin pool is the only price. Recess lets you take a side on the gap without trusting that print. |
| Solution, бейдж | How It Works |
| Solution, H2 | Markets Open at Friday's Close, Stay Open While the Reference Sleeps, and Settle on Its First Fresh Print. |
| Solution, слева | Pick a ticker and a side: above Friday's close or below it. Stake USDG from your wallet. No account, no margin, nothing to manage. |
| Solution, справа | When the feed prints again, the winning side splits the pool pro rata. The weekend price was a rumor. The open is the answer. |
| Слайдер, группы | Pick a Side / The Weekend Pool / Settlement (буллеты — 6.4) |
| Слайд 2 | NVDA Pool / Open until the reference wakes up. |
| Слайд 3 | Settled |
| CTA, H2 | Be There When the Bell Rings |
| CTA, лид | Join the waitlist for the first weekend board. |
| Футер | © 2026 Recess. All rights reserved. |
| Футер, вторая строка (согласовать) | Not affiliated with Robinhood Markets. Not available in the US and other restricted jurisdictions. |

## Приложение B. Расхождения скриншотов и видео

| Место | Скриншот | Видео | Берём |
|---|---|---|---|
| Регистр заголовков | Title Case | обычный | скриншот |
| H3 в карточке 1 | 76.8px, три строки | мелкий, одна строка | скриншот |
| Текст карточки 2 | один вариант | другой | свой текст |
| Колонки Solution | обе по правому краю, ломаные переносы | левая влево, правая вправо | выравнивание со скриншота, без ручных переносов |
| Бейдж Solution | по центру над заголовком | сбоку у объекта | скриншот |
| Ряд 2 бенто, слайдер | нет | есть | видео, размеры ≈ |
