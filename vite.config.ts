import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 미리보기(GitHub Pages)는 /저장소이름/ 아래에서 열려요. 토스 번들은 ./ 기준이에요.
export default defineConfig({
  plugins: [react()],
  base: process.env.PAGES_BASE ?? './',
});
