# Mon SaaS

Base statique générée par [CashSaaS](https://github.com/myxmoney2-crypto/cashsaas). Elle se déploie
telle quelle sur Vercel, puis tu y colles le code généré pour ton idée.

## Déployer

1. Crée un projet gratuit sur [supabase.com](https://supabase.com/dashboard) et note, dans
   **Settings → API**, l'URL du projet et la clé **anon / publishable**.
2. Dans le SQL Editor de Supabase, exécute `supabase/schema.sql` (tables de départ).
3. Clique sur **Deploy to Vercel** depuis ton dashboard CashSaaS. Vercel copie ce dépôt dans ton
   compte GitHub et te demande deux variables :

   | Variable | Valeur |
   |---|---|
   | `SUPABASE_URL` | l'URL de ton projet Supabase |
   | `SUPABASE_ANON_KEY` | la clé anon / publishable |

4. Ton site est en ligne. Le formulaire de la page d'accueil enregistre les emails dans la table `leads`.

## Ajouter ton code généré

Sur GitHub, dans ton dépôt :

1. Ouvre `index.html` → icône crayon → remplace tout le contenu par le fichier `index.html` généré
   → **Commit changes**.
2. Pour les autres fichiers générés (ex. `supabase/schema.sql`, `style.css`), crée-les au même chemin
   (**Add file → Create new file**). Les fichiers SQL vont dans Supabase, pas sur le site.

Vercel redéploie automatiquement à chaque commit.

## Comment ça marche

Un site statique ne peut pas lire de variables d'environnement. Au moment du build,
`scripts/build.mjs` copie les fichiers dans `dist/` et écrit `dist/config.js` :

```js
window.ENV = { SUPABASE_URL: "...", SUPABASE_ANON_KEY: "..." };
```

Ton code lit ses réglages dans `window.ENV` (`config.js` est déjà chargé par `index.html`).

## Sécurité

- `SUPABASE_URL` et `SUPABASE_ANON_KEY` sont **publiques** : n'importe quel visiteur peut les voir.
  C'est normal, la protection vient des règles RLS de tes tables.
- N'utilise **jamais** la clé `service_role` / `secret` : le build s'arrête si tu la mets par erreur.

## Tester en local

```bash
cp .env.example .env    # renseigne les deux valeurs
npm run build
npx serve dist          # ou ouvre un serveur statique de ton choix sur dist/
```
