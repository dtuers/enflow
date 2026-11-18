# PhraseFlow PWA

## Spuštění na počítači
1. Nainstalujte Node.js LTS.
2. V této složce spusťte `npm install`.
3. Potom spusťte `npm run dev`.

## Nasazení na GitHub Pages
1. Nahrajte obsah složky do GitHub repozitáře.
2. Spusťte `npm install` a `npm run build`.
3. Pro GitHub Pages publikujte obsah vytvořené složky `dist`.

Nejjednodušší je použít GitHub Actions workflow přiložený v `.github/workflows/deploy.yml`.

## Přidávání dat
Kategorie jsou v `src/data/`. Zkopírujte existující soubor, změňte ID, název a položky a nový modul přidejte do `src/data/index.js`.
Každá položka používá: `id`, `type`, `cs`, `en`, `distractors`, `hint`.


## Obsah
Přesně 3 500 frází: 700 v každém z pěti tematických souborů. Každé téma má 35 úrovní po 20 frázích.
