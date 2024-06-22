const challenge = document.getElementById("challenge");
const change = document.getElementById("change");
const challenges = ["說ok", "笑", "手指東西", "誇對方", "看窗外", "摸頭", "露牙齒", "說英文", "轉頭", "大笑", "說一個人的名子", "說一個食物名字", "拒絕", "同意", "思考", "碰臉", "問問題", "回答問題", "迴避問題", "說一個動物名字", "說如果", "發呆", "詢問", "罵人", "吐槽遊戲題目難", "做比較", "發出怪聲", "向上看", "向下看", "搖頭", "碰腳", "猶豫", "說肯定句", "說否定句", "說以前的事", "重複說一次其他人說過的話", "10秒不講話", "站起來", "吃東西", "坐下", "長的醜", "長的帥", "嗆別人", "看時間", "討論天氣", "看手機"];
let before = 0;
let current = 0;

function randomChallenge(){
  while(current==before){
    current = Math.floor(Math.random() * challenges.length);
  }
  before = current;
  challenge.textContent = challenges[before];
}

change.onclick = randomChallenge;