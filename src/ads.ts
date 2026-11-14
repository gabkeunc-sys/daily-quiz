// 보상형(리워드) 광고. 앱인토스 인앱 광고 문서의 방식대로
// 화면이 열릴 때 미리 불러 두고(loadFullScreenAd), 사용자가 버튼을 누르면 보여 줘요(showFullScreenAd).
// 보상은 'userEarnedReward'(끝까지 봄) 이벤트에서만 줘요. 누름(clicked)이나 닫힘(dismissed)으로는 주지 않아요.
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

// 지금은 개발자센터가 안내한 테스트용 보상형 광고 ID예요.
// 운영용 ID는 콘솔에서 광고 그룹을 만든 뒤, 출시 직전에 이 한 줄만 바꿔요.
export const REWARDED_AD_GROUP_ID = 'ait-ad-test-rewarded-id';

export function adSupported(): boolean {
  try { return loadFullScreenAd.isSupported() && showFullScreenAd.isSupported(); } catch { return false; }
}

// 광고를 미리 불러 둬요. 다 불러오면 onLoaded가 불려요. 돌려주는 함수로 정리할 수 있어요.
export function preloadRewarded(onLoaded: () => void, onFail: () => void): () => void {
  try {
    return loadFullScreenAd({
      options: { adGroupId: REWARDED_AD_GROUP_ID },
      onEvent: e => { if (e.type === 'loaded') onLoaded(); },
      onError: () => onFail(),
    });
  } catch { onFail(); return () => {}; }
}

// 미리 불러 둔 광고를 보여 줘요. 끝까지 보면 earned=true로 onDone이 불려요.
export function showRewarded(onDone: (earned: boolean) => void): () => void {
  let earned = false;
  let done = false;
  const finish = () => { if (!done) { done = true; onDone(earned); } };
  try {
    return showFullScreenAd({
      options: { adGroupId: REWARDED_AD_GROUP_ID },
      onEvent: e => {
        if (e.type === 'userEarnedReward') earned = true;
        if (e.type === 'dismissed' || e.type === 'failedToShow') finish();
      },
      onError: () => finish(),
    });
  } catch { finish(); return () => {}; }
}
