import {SB_URL,SB_KEY} from '../config.js';

/* supabase-js는 index.html에서 CDN으로 먼저 불러와요 (window.supabase) */
export const sb=window.supabase.createClient(SB_URL,SB_KEY);

/* supabase 응답에서 error를 던지고 data만 돌려줘요 */
export async function q(p){const{data,error}=await p;if(error)throw error;return data;}

export function niceErr(e){
  const m=(e&&e.message)||String(e);
  if(/row-level security|permission denied/i.test(m))return '권한이 없거나 아직 열리지 않은 수업이에요.';
  if(/Invalid login|invalid_credentials/i.test(m))return '비밀번호가 맞지 않아요.';
  if(/Failed to fetch|NetworkError|network/i.test(m))return '인터넷 연결을 확인해 주세요.';
  return m;
}
