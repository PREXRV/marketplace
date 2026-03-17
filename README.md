# Marketplace Frontend

## Zapusk

### 1. Ustanovi zavisimosti:
```bash
npm install
```

### 2. Zapusti backend (dolzhen rabotat na http://127.0.0.1:8000)

### 3. Zapusti frontend:
```bash
npm run dev
```

### 4. Otkroi v brauzere:
- Frontend: http://localhost:3000
- Backend Admin: http://127.0.0.1:8000/admin/

## Problemy?

**"npm ne yavlyaetsya komandoi"**
- Ustanovi Node.js: https://nodejs.org/

**"Oshibka podklyucheniya k serveru"**
- Ubedis chto backend zapuschen
- Proveri: http://127.0.0.1:8000/api/products/

**"Tovary ne pokazyvayutsya"**
- Dobav tovary cherez admin panely
- Ustanovi status "Opublikovan"

## Struktura

- src/app/ - stranici (glavnaya, katalog)
- src/components/ - komponenty
- src/lib/api.ts - API klient

## Stack

- Next.js 14.2.34 (bezopasnaya versiya)
- React 18
- TypeScript
- Tailwind CSS
- Axios
