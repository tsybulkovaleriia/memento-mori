# Memento Mori — Project Plan

> Інтерактивна карта моторошних місць світу з персональними підбірками

---

## Ідея (докручена)

**Memento Mori** — веб-застосунок, де можна досліджувати карту привиджених місць, читати легенди та збирати власні підбірки для подорожей або просто "хочу відвідати".

### Що відрізняє від Atlas Obscura чи Wikipedia:
- Фокус на атмосфері та storytelling, а не енциклопедичності
- Особисті підбірки без реєстрації — просто посилання
- Карта як головний інтерфейс, а не список
- Темна, готична естетика — сам продукт відчувається "моторошно"
- Spooky Score — суб'єктивний рівень моторошності місця

### Категорії місць:
- 🪦 Cemetery — кладовища, некрополі
- 🏚️ Haunted House — будинки з привидами, занедбані будівлі
- ⚔️ Battlefield — місця битв, масових поховань
- 🏥 Asylum — психіатричні лікарні, в'язниці
- 🌲 Cursed Place — прокляті ліси, дороги, природні аномалії
- 👁️ Urban Legend — місця міських легенд, фольклорні об'єкти

### Ключові фічі MVP (середній масштаб):
1. **Карта** з кастомною темною темою + кластеризація маркерів
2. **Фільтри** за категорією та регіоном
3. **Quick preview** при кліку на маркер
4. **Сторінка місця** — назва, фото, легенда, Spooky Score, найближчі місця
5. **Колекції** — без реєстрації, зберігаються локально + синхронізуються через UUID у backend
6. **Шаринг** — `/c/[uuid]` — будь-хто з посиланням бачить колекцію
7. **Clone collection** — "Скопіювати собі" з можливістю редагувати
8. **"I'm feeling cursed"** — кнопка для рандомного місця

### Фічі Phase 2+:
- Пошук (по назві, країні)
- User-submitted places (з модерацією)
- Auth через Google (прив'язати колекції до акаунту)
- PWA / мобільна версія
- Animated fog/atmosphere ефекти на карті
- "Nearby haunted places" на сторінці місця

---

## Архітектура

### Stack

| Layer | Tech | Чому |
|-------|------|------|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR для SEO місць та колекцій, DX |
| Styles | TailwindCSS + CSS variables | Швидко, кастомізовано |
| UI Components | shadcn/ui | Headless, легко адаптувати під dark theme |
| State | Zustand | Простий, без boilerplate |
| Data Fetching | TanStack Query | Кешування, optimistic updates |
| Map | @react-google-maps/api | Google Maps з кастомним JSON стилем |
| Backend | Node.js + Fastify + TypeScript | Швидкий, типізований |
| ORM | Prisma | Зручні міграції, type-safe queries |
| Database | PostgreSQL | JSON fields для images, надійно |
| Deployment | Vercel (front) + Railway (back+db) | Безкоштовно на старті |

### Структура проекту

```
memento-mori/
├── apps/
│   ├── web/                        # Next.js app
│   │   ├── app/
│   │   │   ├── page.tsx            # Редірект на /map
│   │   │   ├── map/
│   │   │   │   └── page.tsx        # Головна — карта (client)
│   │   │   ├── place/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # SSR сторінка місця
│   │   │   ├── c/
│   │   │   │   └── [uuid]/
│   │   │   │       └── page.tsx    # SSR перегляд колекції (шаринг)
│   │   │   └── my-collections/
│   │   │       └── page.tsx        # Мої колекції (client)
│   │   ├── components/
│   │   │   ├── map/                # MapView, Marker, MarkerCluster, Filters
│   │   │   ├── place/              # PlaceCard, PlaceDetail, SpookyScore
│   │   │   ├── collection/         # CollectionCard, CollectionEditor
│   │   │   └── ui/                 # shadcn компоненти
│   │   └── lib/
│   │       ├── api.ts              # API client
│   │       ├── store.ts            # Zustand store
│   │       └── map-style.ts        # Google Maps dark theme JSON
│   │
│   └── api/                        # Fastify backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── places.ts
│       │   │   └── collections.ts
│       │   ├── db/
│       │   │   └── prisma/
│       │   │       └── schema.prisma
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   └── types/                      # Shared TypeScript types
│       └── index.ts
│
├── package.json                    # pnpm workspaces
└── turbo.json                      # Turborepo
```

### API Routes

```
GET  /api/places              — список місць (фільтри: category, country, bbox, limit, offset)
GET  /api/places/random       — рандомне місце
GET  /api/places/:id          — деталі місця
GET  /api/places/:id/nearby   — найближчі N місць

POST /api/collections         — створити колекцію → повертає uuid
GET  /api/collections/:uuid   — отримати колекцію
PUT  /api/collections/:uuid   — оновити колекцію
POST /api/collections/:uuid/clone  — клонувати → новий uuid
POST /api/collections/:uuid/places — додати місце до колекції
DELETE /api/collections/:uuid/places/:placeId
```

---

## База даних (Prisma Schema)

```prisma
model Place {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  lat         Float
  lng         Float
  category    Category
  country     String
  city        String?
  description String   @db.Text
  legend      String   @db.Text          // Markdown — основна легенда/історія
  spookyScore Int      @default(3)       // 1-5
  images      Json     @default("[]")   // [{url, caption, credit}]
  sourceUrl   String?
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())

  collectionPlaces CollectionPlace[]
}

model Collection {
  id          String   @id @default(cuid())  // UUID — це і є share link
  name        String
  description String?
  coverImage  String?
  themeColor  String   @default("#8B5CF6")
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  places CollectionPlace[]
}

model CollectionPlace {
  id             String     @id @default(cuid())
  collection     Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  collectionId   String
  place          Place      @relation(fields: [placeId], references: [id])
  placeId        String
  personalNote   String?
  order          Int        @default(0)
  addedAt        DateTime   @default(now())

  @@unique([collectionId, placeId])
}

enum Category {
  CEMETERY
  HAUNTED_HOUSE
  BATTLEFIELD
  ASYLUM
  CURSED_PLACE
  URBAN_LEGEND
}
```

---

## Дизайн-система

### Колірна палітра

```css
:root {
  /* Backgrounds */
  --bg-base: #09090F;          /* майже чорний, синюватий відтінок */
  --bg-surface: #111118;
  --bg-elevated: #18181F;
  --bg-overlay: #1F1F2A;

  /* Borders */
  --border-subtle: #1E1E2E;
  --border-default: #2A2A3E;
  --border-strong: #3A3A56;

  /* Brand */
  --purple: #8B5CF6;           /* primary — фіолетовий */
  --purple-dim: #6D28D9;
  --green: #10B981;            /* accent — "моторошний" зелений */
  --red: #EF4444;

  /* Text */
  --text-primary: #F0F0F5;
  --text-secondary: #A0A0B8;
  --text-muted: #5A5A78;
}
```

### Типографіка

- **Заголовки**: Playfair Display (serif) — gothic feel
- **Body**: Inter — читабельно, сучасно
- **Координати / коди**: JetBrains Mono

### Маркери на карті
Custom SVG маркери з glow-ефектом. Різний колір/іконка за категорією. При hover — збільшення + shadow. При виборі — pulse animation.

### Кастомний стиль Google Maps
Темна карта з приглушеними кольорами, без POI-шуму, мінімалістичні лейбли, підсвічені дороги у темно-сірому. Вода — темно-синя.

### Ключові компоненти

**MapView** — повноекранна карта, панель фільтрів зверху, sidebar з деталями справа (або bottom sheet на мобільному)

**PlaceCard** — у quick preview на карті: фото, назва, категорія, Spooky Score (💀 іконки)

**PlaceDetail** — повна сторінка: hero image, breadcrumbs, легенда (markdown), галерея, nearby, кнопка "Add to collection"

**CollectionEditor** — drawer/modal для керування колекцією, drag-to-reorder місць

**ShareBanner** — вгорі при перегляді чужої колекції: "Переглядаєш колекцію X · Clone →"

---

## Roadmap

### Phase 1 — MVP (тижні 1-3)
- [ ] Monorepo setup (pnpm + Turborepo)
- [ ] Next.js app з темною темою
- [ ] Google Maps з кастомним стилем + маркери
- [ ] Seed data: 30 місць (різних категорій, різних країн)
- [ ] Place detail page (SSR + metadata для SEO)
- [ ] Колекції в localStorage
- [ ] Share/clone via UUID (backend collections API)
- [ ] Deploy: Vercel + Railway

### Phase 2 — Наповнення та UX (тижні 4-6)
- [ ] Пошук місць
- [ ] Фільтри + кластеризація маркерів
- [ ] "I'm feeling cursed" рандом
- [ ] Nearby places
- [ ] Мобільний UX (bottom sheet замість sidebar)
- [ ] Seed data до 100+ місць

### Phase 3 — Auth та спільнота (тижні 7+)
- [ ] Auth через Google (NextAuth)
- [ ] User-submitted places + модерація
- [ ] Прив'язка колекцій до акаунту
- [ ] PWA manifest

---

## Перший крок — що пишемо першим

1. `pnpm create next-app` з TypeScript + Tailwind
2. Підключаємо Google Maps API
3. Кастомний стиль карти (JSON)
4. Базові маркери з seed data (JSON файл)
5. Quick preview при кліку
