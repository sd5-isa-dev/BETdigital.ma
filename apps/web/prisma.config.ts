import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // Indique automatiquement à Prisma d'utiliser tout le dossier "schema"
  schema: './prisma/schema', 
  datasource: {
    // Le CLI Prisma utilise cette URL pour synchroniser (push) la base de données
    url: env('DIRECT_URL'), 
  },
});