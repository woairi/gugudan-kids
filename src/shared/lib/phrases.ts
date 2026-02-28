export const PRAISES = [
  "정답! 최고야!",
  "와! 진짜 잘했어!",
  "딩동댕~ 맞았어!",
  "완전 멋져!",
  "똑똑한데?",
  "계속 가볼까?",
  "오~ 빠르다!",
  "맞았어! 짝짝짝!",
  "대단해!",
  "정답! 칭찬 스티커 한 장!",
];

export const ENCOURAGES = [
  "아쉽다! 다음은 맞힐 수 있어!",
  "괜찮아! 다시 해보자!",
  "조금만 더! 할 수 있어!",
  "틀려도 괜찮아 🙂",
  "다음 문제에서 만회하자!",
  "한 번 더 생각해볼까?",
  "연습하면 더 잘 돼!",
  "아깝다! 거의 맞았어!",
  "천천히 해도 돼!",
  "괜찮아, 계속 가자!",
];

export function pickRandom(list: string[]) {
  return list[Math.floor(Math.random() * list.length)];
}
