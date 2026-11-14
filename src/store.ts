// 토스 앱 안에서는 앱인토스 저장 기능을, 미리보기(토스 앱 밖)에서는 브라우저 저장소를 써요.
import { Storage } from '@apps-in-toss/web-framework';

export async function getItem(key: string): Promise<string | null> {
  try { return await Storage.getItem(key); } catch { return localStorage.getItem(key); }
}
export async function setItem(key: string, value: string): Promise<void> {
  try { await Storage.setItem(key, value); } catch { localStorage.setItem(key, value); }
}
